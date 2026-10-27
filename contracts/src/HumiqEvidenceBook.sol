// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title HumiqEvidenceBook
/// @notice Public, append-only record of research briefs, reviewer sign-offs and evidence stamps on Robinhood Chain.
///
/// Three things can be written, all of them fingerprints only:
///  1. anchorBrief: an author records the hash of an exported brief together with an evidence root (a hash over
///     the sorted SHA-256 fingerprints of the evidence the brief cites) and how many evidence items and claims it has.
///  2. signOff: a reviewer other than the author records a verdict on an anchored brief plus the hash of the review
///     checklist. One sign-off per reviewer per brief, never edited; a changed opinion belongs to a new brief.
///  3. stampEvidence: anyone records that an evidence fingerprint existed by the current block. The first stamp of
///     a fingerprint is kept; later stamps of the same fingerprint are skipped.
///
/// What a record proves: this address wrote these hashes at this block. It does not store documents, files, names
/// or any personal data, does not check that a brief is true or that evidence was obtained lawfully, holds no funds
/// and has nobody who can change or remove a record.
///
/// @dev No owner, no admin, no fee, no pause, no upgrade path, no constructor arguments, nothing payable.
///      On Arbitrum-style chains `block.number` is the parent chain's block, so the chain's own block is read from
///      the ArbSys precompile when it answers, and from `block.number` everywhere else (local tests).
contract HumiqEvidenceBook {
    struct Brief {
        address author;
        uint32 evidenceCount;
        uint32 claimCount;
        uint32 signOffCount;
        uint64 chainBlock;
        uint64 anchoredAt;
        bytes32 briefHash;
        bytes32 evidenceRoot;
    }

    struct SignOff {
        uint256 briefId;
        address reviewer;
        uint8 verdict;
        uint64 chainBlock;
        uint64 signedAt;
        bytes32 checklistHash;
    }

    struct Stamp {
        address stamper;
        uint64 chainBlock;
        uint64 stampedAt;
    }

    /// @notice Verdicts a reviewer can give.
    uint8 public constant SUPPORTED = 1;
    uint8 public constant NEEDS_WORK = 2;
    uint8 public constant NOT_SUPPORTED = 3;

    /// @notice Most ids returned by one paged read.
    uint256 public constant MAX_PAGE = 100;
    /// @notice Most fingerprints stamped in one call.
    uint256 public constant MAX_STAMPS = 32;
    /// @notice Upper bound for evidence and claim counts of one brief.
    uint32 public constant MAX_COUNT = 10_000;

    address private constant ARB_SYS = address(0x64);
    bytes4 private constant ARB_BLOCK_NUMBER = 0xa3b1b31d;
    /// @dev Gas forwarded to ArbSys; the real precompile needs about a thousand.
    uint256 private constant ARB_SYS_GAS = 30_000;

    /// @notice Briefs ever anchored. Ids start at 1.
    uint256 public briefCount;
    /// @notice Sign-offs ever recorded. Ids start at 1.
    uint256 public signOffCount;
    /// @notice Distinct evidence fingerprints ever stamped.
    uint256 public stampCount;

    mapping(uint256 id => Brief) private _briefs;
    mapping(uint256 id => SignOff) private _signOffs;
    /// @dev keccak256(abi.encode(author, briefHash)) => brief id.
    mapping(bytes32 key => uint256) private _briefByKey;
    mapping(address author => uint256[]) private _briefsOf;
    mapping(uint256 briefId => uint256[]) private _signOffsOf;
    mapping(uint256 briefId => mapping(address reviewer => uint256)) private _signOffBy;
    mapping(address reviewer => uint256[]) private _reviewsOf;
    mapping(bytes32 evidenceHash => Stamp) private _stamps;

    event BriefAnchored(
        uint256 indexed id,
        address indexed author,
        bytes32 indexed briefHash,
        bytes32 evidenceRoot,
        uint32 evidenceCount,
        uint32 claimCount,
        uint64 chainBlock
    );
    event SignedOff(uint256 indexed id, uint256 indexed briefId, address indexed reviewer, uint8 verdict, bytes32 checklistHash, uint64 chainBlock);
    event EvidenceStamped(bytes32 indexed evidenceHash, address indexed stamper, uint64 chainBlock);

    error ZeroHash();
    error BadCount();
    error AlreadyAnchored(uint256 id);
    error UnknownBrief(uint256 id);
    error UnknownSignOff(uint256 id);
    error BadVerdict();
    error SelfReview();
    error AlreadySignedOff(uint256 id);
    error BadStampList();

    /// @notice Anchors a brief. The caller is its author.
    /// @param briefHash keccak-256 of the exported brief (Markdown, as downloaded).
    /// @param evidenceRoot keccak-256 over the sorted SHA-256 fingerprints of the cited evidence.
    /// @param evidenceCount Number of evidence items behind the root, 1 to MAX_COUNT.
    /// @param claimCount Number of claims in the brief, 1 to MAX_COUNT.
    function anchorBrief(bytes32 briefHash, bytes32 evidenceRoot, uint32 evidenceCount, uint32 claimCount) external returns (uint256 id) {
        if (briefHash == bytes32(0) || evidenceRoot == bytes32(0)) revert ZeroHash();
        if (evidenceCount == 0 || claimCount == 0 || evidenceCount > MAX_COUNT || claimCount > MAX_COUNT) revert BadCount();
        bytes32 key = keccak256(abi.encode(msg.sender, briefHash));
        uint256 existing = _briefByKey[key];
        if (existing != 0) revert AlreadyAnchored(existing);

        uint64 nowBlock = chainBlock();
        id = ++briefCount;
        _briefByKey[key] = id;
        _briefsOf[msg.sender].push(id);
        _briefs[id] = Brief({
            author: msg.sender,
            evidenceCount: evidenceCount,
            claimCount: claimCount,
            signOffCount: 0,
            chainBlock: nowBlock,
            anchoredAt: uint64(block.timestamp),
            briefHash: briefHash,
            evidenceRoot: evidenceRoot
        });
        emit BriefAnchored(id, msg.sender, briefHash, evidenceRoot, evidenceCount, claimCount, nowBlock);
    }

    /// @notice Records the caller's verdict on brief `briefId`. The author cannot sign off their own brief.
    /// @param verdict SUPPORTED (1), NEEDS_WORK (2) or NOT_SUPPORTED (3).
    /// @param checklistHash keccak-256 of the reviewer's checklist and per-claim verdicts.
    function signOff(uint256 briefId, uint8 verdict, bytes32 checklistHash) external returns (uint256 id) {
        if (briefId == 0 || briefId > briefCount) revert UnknownBrief(briefId);
        if (verdict < SUPPORTED || verdict > NOT_SUPPORTED) revert BadVerdict();
        if (checklistHash == bytes32(0)) revert ZeroHash();
        Brief storage b = _briefs[briefId];
        if (b.author == msg.sender) revert SelfReview();
        uint256 prior = _signOffBy[briefId][msg.sender];
        if (prior != 0) revert AlreadySignedOff(prior);

        uint64 nowBlock = chainBlock();
        id = ++signOffCount;
        _signOffBy[briefId][msg.sender] = id;
        _signOffsOf[briefId].push(id);
        _reviewsOf[msg.sender].push(id);
        b.signOffCount += 1;
        _signOffs[id] = SignOff({
            briefId: briefId,
            reviewer: msg.sender,
            verdict: verdict,
            chainBlock: nowBlock,
            signedAt: uint64(block.timestamp),
            checklistHash: checklistHash
        });
        emit SignedOff(id, briefId, msg.sender, verdict, checklistHash, nowBlock);
    }

    /// @notice Stamps 1 to MAX_STAMPS evidence fingerprints. Already stamped ones are skipped.
    /// @return fresh How many of them were stamped for the first time.
    function stampEvidence(bytes32[] calldata hashes) external returns (uint256 fresh) {
        uint256 n = hashes.length;
        if (n == 0 || n > MAX_STAMPS) revert BadStampList();
        uint64 nowBlock = chainBlock();
        for (uint256 i = 0; i < n; i++) {
            bytes32 h = hashes[i];
            if (h == bytes32(0)) revert ZeroHash();
            Stamp storage s = _stamps[h];
            if (s.stamper != address(0)) continue;
            s.stamper = msg.sender;
            s.chainBlock = nowBlock;
            s.stampedAt = uint64(block.timestamp);
            fresh++;
            emit EvidenceStamped(h, msg.sender, nowBlock);
        }
        stampCount += fresh;
    }

    // ---------------------------------------------------------------- reads

    /// @notice Brief `id`. Reverts for an id that does not exist.
    function brief(uint256 id) external view returns (Brief memory) {
        if (id == 0 || id > briefCount) revert UnknownBrief(id);
        return _briefs[id];
    }

    /// @notice Id of the brief `author` anchored with `briefHash`, or 0.
    function findBrief(address author, bytes32 briefHash) external view returns (uint256) {
        return _briefByKey[keccak256(abi.encode(author, briefHash))];
    }

    /// @notice How many briefs `author` anchored.
    function briefCountOf(address author) external view returns (uint256) {
        return _briefsOf[author].length;
    }

    /// @notice Up to `limit` (max MAX_PAGE) brief ids of `author`, newest first, skipping `offset`.
    function briefsOf(address author, uint256 offset, uint256 limit) external view returns (uint256[] memory) {
        return _page(_briefsOf[author], offset, limit);
    }

    /// @notice Sign-off `id`. Reverts for an id that does not exist.
    function signOffAt(uint256 id) external view returns (SignOff memory) {
        if (id == 0 || id > signOffCount) revert UnknownSignOff(id);
        return _signOffs[id];
    }

    /// @notice Up to `limit` (max MAX_PAGE) sign-off ids of brief `briefId`, newest first, skipping `offset`.
    function signOffsOf(uint256 briefId, uint256 offset, uint256 limit) external view returns (uint256[] memory) {
        return _page(_signOffsOf[briefId], offset, limit);
    }

    /// @notice Sign-off id of `reviewer` on brief `briefId`, or 0.
    function signOffBy(uint256 briefId, address reviewer) external view returns (uint256) {
        return _signOffBy[briefId][reviewer];
    }

    /// @notice How many sign-offs `reviewer` recorded.
    function reviewCountOf(address reviewer) external view returns (uint256) {
        return _reviewsOf[reviewer].length;
    }

    /// @notice Up to `limit` (max MAX_PAGE) sign-off ids by `reviewer`, newest first, skipping `offset`.
    function reviewsOf(address reviewer, uint256 offset, uint256 limit) external view returns (uint256[] memory) {
        return _page(_reviewsOf[reviewer], offset, limit);
    }

    /// @notice First stamp of `evidenceHash` (stamper is the zero address when never stamped).
    function stampOf(bytes32 evidenceHash) external view returns (Stamp memory) {
        return _stamps[evidenceHash];
    }

    /// @notice The chain's current block: ArbSys `arbBlockNumber()` when the precompile answers, else `block.number`.
    function chainBlock() public view returns (uint64) {
        (bool ok, bytes memory ret) = ARB_SYS.staticcall{gas: ARB_SYS_GAS}(abi.encodeWithSelector(ARB_BLOCK_NUMBER));
        if (ok && ret.length == 32) {
            uint256 n = abi.decode(ret, (uint256));
            if (n != 0 && n <= type(uint64).max) return uint64(n);
        }
        return uint64(block.number);
    }

    function _page(uint256[] storage all, uint256 offset, uint256 limit) private view returns (uint256[] memory ids) {
        uint256 n = all.length;
        if (limit > MAX_PAGE) limit = MAX_PAGE;
        if (offset >= n || limit == 0) return new uint256[](0);
        uint256 count = n - offset;
        if (count > limit) count = limit;
        ids = new uint256[](count);
        for (uint256 i = 0; i < count; i++) ids[i] = all[n - 1 - offset - i];
    }
}
