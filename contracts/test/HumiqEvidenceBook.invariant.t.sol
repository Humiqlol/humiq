// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {HumiqEvidenceBook} from "../src/HumiqEvidenceBook.sol";

/// Drives random anchors, sign-offs and stamps from a few actors and keeps its own tally.
contract BookHandler is Test {
    HumiqEvidenceBook public book;
    address[4] public actors = [address(0x1001), address(0x1002), address(0x1003), address(0x1004)];
    uint256 public anchors;
    uint256 public signOffs;
    uint256 public stamps;
    mapping(bytes32 => bool) public seen;

    constructor(HumiqEvidenceBook b) {
        book = b;
    }

    function anchor(uint256 who, bytes32 h, uint32 ev, uint32 cl) external {
        address a = actors[who % 4];
        h = keccak256(abi.encode(h, "b")); // never zero
        ev = uint32(bound(ev, 1, 50));
        cl = uint32(bound(cl, 1, 50));
        if (book.findBrief(a, h) != 0) return;
        vm.prank(a);
        book.anchorBrief(h, keccak256(abi.encode(h, "root")), ev, cl);
        anchors++;
    }

    function sign(uint256 who, uint256 briefSeed, uint8 verdict) external {
        uint256 n = book.briefCount();
        if (n == 0) return;
        uint256 id = bound(briefSeed, 1, n);
        address r = actors[who % 4];
        verdict = uint8(bound(verdict, 1, 3));
        if (book.brief(id).author == r || book.signOffBy(id, r) != 0) return;
        vm.prank(r);
        book.signOff(id, verdict, keccak256(abi.encode(id, r)));
        signOffs++;
    }

    function stamp(uint256 who, uint8 seed) external {
        bytes32 h = keccak256(abi.encode("e", seed % 40));
        bytes32[] memory hs = new bytes32[](1);
        hs[0] = h;
        vm.prank(actors[who % 4]);
        uint256 fresh = book.stampEvidence(hs);
        if (!seen[h]) {
            seen[h] = true;
            stamps++;
            assertEq(fresh, 1);
        } else {
            assertEq(fresh, 0);
        }
    }

    function actorAt(uint256 i) external view returns (address) {
        return actors[i];
    }
}

contract HumiqEvidenceBookInvariantTest is Test {
    HumiqEvidenceBook book;
    BookHandler handler;

    function setUp() public {
        book = new HumiqEvidenceBook();
        handler = new BookHandler(book);
        targetContract(address(handler));
    }

    function invariant_countsMatch() public view {
        assertEq(book.briefCount(), handler.anchors());
        assertEq(book.signOffCount(), handler.signOffs());
        assertEq(book.stampCount(), handler.stamps());
        uint256 total;
        for (uint256 i = 0; i < 4; i++) total += book.briefCountOf(handler.actorAt(i));
        assertEq(total, book.briefCount());
        uint256 reviews;
        for (uint256 i = 0; i < 4; i++) reviews += book.reviewCountOf(handler.actorAt(i));
        assertEq(reviews, book.signOffCount());
    }

    function invariant_noSelfReviewAndPerBriefTally() public view {
        uint256 sum;
        uint256 n = book.briefCount();
        for (uint256 id = 1; id <= n; id++) {
            HumiqEvidenceBook.Brief memory b = book.brief(id);
            sum += b.signOffCount;
            uint256[] memory ids = book.signOffsOf(id, 0, 100);
            assertEq(ids.length, b.signOffCount);
            for (uint256 k = 0; k < ids.length; k++) {
                HumiqEvidenceBook.SignOff memory s = book.signOffAt(ids[k]);
                assertTrue(s.reviewer != b.author);
                assertEq(s.briefId, id);
                assertEq(book.signOffBy(id, s.reviewer), ids[k]);
            }
        }
        assertEq(sum, book.signOffCount());
    }
}
