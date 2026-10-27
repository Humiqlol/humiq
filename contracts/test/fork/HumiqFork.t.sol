// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {HumiqEvidenceBook} from "../../src/HumiqEvidenceBook.sol";

/// Fork test against Robinhood Chain mainnet (chain id 4663):
///   forge test --match-path 'test/fork/*' --fork-url https://robinhood.drpc.org --evm-version cancun
/// The book integrates with no other contract; this checks it deploys and records on the real chain state and
/// that its block reading stays sane there.
contract HumiqForkTest is Test {
    function setUp() public {
        vm.skip(block.chainid != 4663);
    }

    function test_fork_anchorSignAndStamp() public {
        HumiqEvidenceBook book = new HumiqEvidenceBook();
        uint64 nowBlock = book.chainBlock();
        assertGt(nowBlock, 0);
        address author = makeAddr("author");
        address reviewer = makeAddr("reviewer");
        vm.prank(author);
        uint256 id = book.anchorBrief(keccak256("brief"), keccak256("root"), 2, 1);
        assertEq(book.brief(id).chainBlock, nowBlock);
        vm.prank(reviewer);
        book.signOff(id, 1, keccak256("checklist"));
        bytes32[] memory hs = new bytes32[](1);
        hs[0] = keccak256("evidence");
        assertEq(book.stampEvidence(hs), 1);
    }

    function test_fork_chainBlockIsTheChainsOwnBlock() public {
        HumiqEvidenceBook book = new HumiqEvidenceBook();
        // ArbSys is not emulated on a fork; the fallback is the forked block number, the chain's own block.
        assertEq(book.chainBlock(), uint64(block.number));
        assertGt(block.number, 90_000_000);
    }
}
