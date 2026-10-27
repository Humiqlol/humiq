// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {HumiqEvidenceBook} from "../src/HumiqEvidenceBook.sol";

contract HumiqEvidenceBookTest is Test {
    HumiqEvidenceBook book;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);
    address carol = address(0xCA201);
    bytes32 constant B1 = keccak256("brief-1");
    bytes32 constant B2 = keccak256("brief-2");
    bytes32 constant R1 = keccak256("root-1");
    bytes32 constant C1 = keccak256("checklist-1");

    event BriefAnchored(uint256 indexed id, address indexed author, bytes32 indexed briefHash, bytes32 evidenceRoot, uint32 evidenceCount, uint32 claimCount, uint64 chainBlock);
    event SignedOff(uint256 indexed id, uint256 indexed briefId, address indexed reviewer, uint8 verdict, bytes32 checklistHash, uint64 chainBlock);
    event EvidenceStamped(bytes32 indexed evidenceHash, address indexed stamper, uint64 chainBlock);

    function setUp() public {
        book = new HumiqEvidenceBook();
        vm.roll(1000);
        vm.warp(1_800_000_000);
    }

    function _anchor(address who, bytes32 h) internal returns (uint256) {
        vm.prank(who);
        return book.anchorBrief(h, R1, 3, 2);
    }

    function test_anchorBrief() public {
        vm.expectEmit(true, true, true, true);
        emit BriefAnchored(1, alice, B1, R1, 3, 2, 1000);
        uint256 id = _anchor(alice, B1);
        assertEq(id, 1);
        assertEq(book.briefCount(), 1);
        HumiqEvidenceBook.Brief memory b = book.brief(1);
        assertEq(b.author, alice);
        assertEq(b.evidenceCount, 3);
        assertEq(b.claimCount, 2);
        assertEq(b.signOffCount, 0);
        assertEq(b.chainBlock, 1000);
        assertEq(b.anchoredAt, 1_800_000_000);
        assertEq(b.briefHash, B1);
        assertEq(b.evidenceRoot, R1);
        assertEq(book.findBrief(alice, B1), 1);
        assertEq(book.findBrief(bob, B1), 0);
        assertEq(book.briefCountOf(alice), 1);
    }

    function test_sameHashTwiceBySameAuthorRefused() public {
        _anchor(alice, B1);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(HumiqEvidenceBook.AlreadyAnchored.selector, 1));
        book.anchorBrief(B1, R1, 3, 2);
    }

    function test_sameHashByOtherAuthorIsSeparate() public {
        _anchor(alice, B1);
        uint256 id = _anchor(bob, B1);
        assertEq(id, 2);
        assertEq(book.findBrief(bob, B1), 2);
        assertEq(book.findBrief(alice, B1), 1);
    }

    function test_anchorRejectsZeroAndBadCounts() public {
        vm.startPrank(alice);
        vm.expectRevert(HumiqEvidenceBook.ZeroHash.selector);
        book.anchorBrief(bytes32(0), R1, 1, 1);
        vm.expectRevert(HumiqEvidenceBook.ZeroHash.selector);
        book.anchorBrief(B1, bytes32(0), 1, 1);
        vm.expectRevert(HumiqEvidenceBook.BadCount.selector);
        book.anchorBrief(B1, R1, 0, 1);
        vm.expectRevert(HumiqEvidenceBook.BadCount.selector);
        book.anchorBrief(B1, R1, 1, 0);
        vm.expectRevert(HumiqEvidenceBook.BadCount.selector);
        book.anchorBrief(B1, R1, 10_001, 1);
        vm.expectRevert(HumiqEvidenceBook.BadCount.selector);
        book.anchorBrief(B1, R1, 1, 10_001);
        book.anchorBrief(B1, R1, 10_000, 10_000);
        vm.stopPrank();
    }

    function test_signOff() public {
        _anchor(alice, B1);
        vm.roll(1005);
        vm.expectEmit(true, true, true, true);
        emit SignedOff(1, 1, bob, 1, C1, 1005);
        vm.prank(bob);
        uint256 id = book.signOff(1, 1, C1);
        assertEq(id, 1);
        HumiqEvidenceBook.SignOff memory s = book.signOffAt(1);
        assertEq(s.briefId, 1);
        assertEq(s.reviewer, bob);
        assertEq(s.verdict, 1);
        assertEq(s.chainBlock, 1005);
        assertEq(s.checklistHash, C1);
        assertEq(book.brief(1).signOffCount, 1);
        assertEq(book.signOffBy(1, bob), 1);
        assertEq(book.reviewCountOf(bob), 1);
    }

    function test_selfReviewRefused() public {
        _anchor(alice, B1);
        vm.prank(alice);
        vm.expectRevert(HumiqEvidenceBook.SelfReview.selector);
        book.signOff(1, 1, C1);
    }

    function test_oneSignOffPerReviewer() public {
        _anchor(alice, B1);
        vm.startPrank(bob);
        book.signOff(1, 2, C1);
        vm.expectRevert(abi.encodeWithSelector(HumiqEvidenceBook.AlreadySignedOff.selector, 1));
        book.signOff(1, 1, C1);
        vm.stopPrank();
        assertEq(book.signOffAt(1).verdict, 2, "first verdict stays");
    }

    function test_signOffChecks() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(HumiqEvidenceBook.UnknownBrief.selector, 1));
        book.signOff(1, 1, C1);
        _anchor(alice, B1);
        vm.startPrank(bob);
        vm.expectRevert(abi.encodeWithSelector(HumiqEvidenceBook.UnknownBrief.selector, 0));
        book.signOff(0, 1, C1);
        vm.expectRevert(HumiqEvidenceBook.BadVerdict.selector);
        book.signOff(1, 0, C1);
        vm.expectRevert(HumiqEvidenceBook.BadVerdict.selector);
        book.signOff(1, 4, C1);
        vm.expectRevert(HumiqEvidenceBook.ZeroHash.selector);
        book.signOff(1, 1, bytes32(0));
        vm.stopPrank();
    }

    function test_unknownReads() public {
        vm.expectRevert(abi.encodeWithSelector(HumiqEvidenceBook.UnknownBrief.selector, 0));
        book.brief(0);
        vm.expectRevert(abi.encodeWithSelector(HumiqEvidenceBook.UnknownBrief.selector, 1));
        book.brief(1);
        vm.expectRevert(abi.encodeWithSelector(HumiqEvidenceBook.UnknownSignOff.selector, 1));
        book.signOffAt(1);
    }

    function test_pagesNewestFirst() public {
        for (uint256 i = 1; i <= 5; i++) _anchor(alice, keccak256(abi.encode(i)));
        uint256[] memory ids = book.briefsOf(alice, 0, 3);
        assertEq(ids.length, 3);
        assertEq(ids[0], 5);
        assertEq(ids[2], 3);
        ids = book.briefsOf(alice, 3, 10);
        assertEq(ids.length, 2);
        assertEq(ids[1], 1);
        assertEq(book.briefsOf(alice, 5, 10).length, 0);
        assertEq(book.briefsOf(alice, 0, 0).length, 0);
        vm.prank(bob);
        book.signOff(5, 1, C1);
        vm.prank(carol);
        book.signOff(5, 3, C1);
        ids = book.signOffsOf(5, 0, 10);
        assertEq(ids.length, 2);
        assertEq(ids[0], 2);
        assertEq(book.reviewsOf(carol, 0, 10)[0], 2);
    }

    function test_pageCapped() public {
        for (uint256 i = 1; i <= 101; i++) _anchor(alice, keccak256(abi.encode(i)));
        assertEq(book.briefsOf(alice, 0, 500).length, 100);
    }

    function test_stampEvidence() public {
        bytes32[] memory hs = new bytes32[](2);
        hs[0] = keccak256("e1");
        hs[1] = keccak256("e2");
        vm.expectEmit(true, true, false, true);
        emit EvidenceStamped(hs[0], alice, 1000);
        vm.prank(alice);
        assertEq(book.stampEvidence(hs), 2);
        assertEq(book.stampCount(), 2);
        HumiqEvidenceBook.Stamp memory s = book.stampOf(hs[0]);
        assertEq(s.stamper, alice);
        assertEq(s.chainBlock, 1000);
        assertEq(s.stampedAt, 1_800_000_000);

        // A later stamp of the same fingerprint is skipped; the first record stays.
        vm.roll(2000);
        hs[1] = keccak256("e3");
        vm.recordLogs();
        vm.prank(bob);
        assertEq(book.stampEvidence(hs), 1);
        assertEq(vm.getRecordedLogs().length, 1);
        assertEq(book.stampOf(hs[0]).stamper, alice);
        assertEq(book.stampOf(hs[1]).stamper, bob);
        assertEq(book.stampCount(), 3);
        assertEq(book.stampOf(keccak256("never")).stamper, address(0));
    }

    function test_stampChecks() public {
        bytes32[] memory none = new bytes32[](0);
        vm.expectRevert(HumiqEvidenceBook.BadStampList.selector);
        book.stampEvidence(none);
        bytes32[] memory many = new bytes32[](33);
        for (uint256 i = 0; i < 33; i++) many[i] = keccak256(abi.encode(i));
        vm.expectRevert(HumiqEvidenceBook.BadStampList.selector);
        book.stampEvidence(many);
        bytes32[] memory zero = new bytes32[](1);
        vm.expectRevert(HumiqEvidenceBook.ZeroHash.selector);
        book.stampEvidence(zero);
        bytes32[] memory full = new bytes32[](32);
        for (uint256 i = 0; i < 32; i++) full[i] = keccak256(abi.encode(i));
        assertEq(book.stampEvidence(full), 32);
    }

    function test_repeatsInsideOneCall() public {
        bytes32[] memory hs = new bytes32[](3);
        hs[0] = keccak256("x");
        hs[1] = keccak256("x");
        hs[2] = keccak256("y");
        assertEq(book.stampEvidence(hs), 2);
        assertEq(book.stampCount(), 2);
    }

    function test_noValueAccepted() public {
        (bool ok,) = address(book).call{value: 1}("");
        assertFalse(ok);
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        (ok,) = address(book).call{value: 1}(abi.encodeCall(book.anchorBrief, (B2, R1, 1, 1)));
        assertFalse(ok);
    }

    function test_chainBlockFallsBackWithoutArbSys() public view {
        assertEq(book.chainBlock(), 1000);
    }

    function test_chainBlockReadsArbSys() public {
        vm.mockCall(address(0x64), abi.encodeWithSelector(bytes4(0xa3b1b31d)), abi.encode(uint256(95_000_000)));
        assertEq(book.chainBlock(), 95_000_000);
        uint256 id = _anchor(alice, B1);
        assertEq(book.brief(id).chainBlock, 95_000_000);
    }

    function test_chainBlockIgnoresZeroArbSys() public {
        vm.mockCall(address(0x64), abi.encodeWithSelector(bytes4(0xa3b1b31d)), abi.encode(uint256(0)));
        assertEq(book.chainBlock(), 1000);
    }

    function testFuzz_anchorAndFind(address author, bytes32 h, bytes32 root, uint32 ev, uint32 cl) public {
        vm.assume(h != bytes32(0) && root != bytes32(0));
        ev = uint32(bound(ev, 1, 10_000));
        cl = uint32(bound(cl, 1, 10_000));
        vm.prank(author);
        uint256 id = book.anchorBrief(h, root, ev, cl);
        assertEq(book.findBrief(author, h), id);
        HumiqEvidenceBook.Brief memory b = book.brief(id);
        assertEq(b.author, author);
        assertEq(b.evidenceCount, ev);
        assertEq(b.claimCount, cl);
    }

    function testFuzz_verdictRange(uint8 v) public {
        _anchor(alice, B1);
        vm.prank(bob);
        if (v < 1 || v > 3) {
            vm.expectRevert(HumiqEvidenceBook.BadVerdict.selector);
            book.signOff(1, v, C1);
        } else {
            book.signOff(1, v, C1);
            assertEq(book.signOffAt(1).verdict, v);
        }
    }

    function testFuzz_stampFirstWins(bytes32 h, address a, address b) public {
        vm.assume(h != bytes32(0) && a != address(0) && b != address(0));
        bytes32[] memory hs = new bytes32[](1);
        hs[0] = h;
        vm.prank(a);
        book.stampEvidence(hs);
        vm.roll(5000);
        vm.prank(b);
        assertEq(book.stampEvidence(hs), 0);
        assertEq(book.stampOf(h).stamper, a);
        assertEq(book.stampOf(h).chainBlock, 1000);
    }

    function test_gasReport() public {
        vm.prank(alice);
        uint256 g = gasleft();
        book.anchorBrief(B1, R1, 3, 2);
        emit log_named_uint("anchorBrief gas", g - gasleft());
        vm.prank(bob);
        g = gasleft();
        book.signOff(1, 1, C1);
        emit log_named_uint("signOff gas", g - gasleft());
        bytes32[] memory hs = new bytes32[](5);
        for (uint256 i = 0; i < 5; i++) hs[i] = keccak256(abi.encode("g", i));
        g = gasleft();
        book.stampEvidence(hs);
        emit log_named_uint("stampEvidence x5 gas", g - gasleft());
    }
}
