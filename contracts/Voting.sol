//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.3;

import "hardhat/console.sol";

contract Voting {
  struct Proposal {
    string name;
    uint votesCount;
  }
  struct Voter {
      bool voted;  // true si esa persona ya ha votado
      uint vote;   // índice de la propuesta votada
  }
  Proposal[] public proposals;

  address chairperson;

  mapping(address => Voter) public voters;

  modifier onlyAdministrator() {
    require(msg.sender == chairperson,"the caller of this function must be the administrator");
    _;
  }

  modifier onlyUsersNotVotedYet() {
    Voter storage sender = voters[msg.sender];
    require(!sender.voted,"you alredy voted");
    _;
  }

  constructor(){
    ///console.log("set chairperson",_address);
    chairperson=msg.sender;
  }

  function addProposal(string memory _name) public onlyAdministrator{
    //console.log("set proposal",_name);
    proposals.push(Proposal({
      name: _name,
      votesCount: 0
    }));
  }

  function getProposals() public view returns (uint256) {
    return proposals.length;
  }
  function getInfoProposals() public view returns (Proposal[] memory){
    return proposals;
  }
  function getChairPerson() public view returns (address) {
    return chairperson;
  }

  function vote(uint32 index) public onlyUsersNotVotedYet{
    Voter storage sender = voters[msg.sender];
    proposals[index].votesCount += 1;
    sender.voted=true;
    sender.vote=index;
  }
  function getVotesById(uint index) public view returns(uint256){
    return proposals[index].votesCount;
  }
}
