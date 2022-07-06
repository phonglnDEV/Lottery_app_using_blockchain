import './App.css'
import { useEffect, useState } from 'react'
import { Contract, ethers } from 'ethers'
import lotteryAbi from "./lottery.abi.json"
import { resolveProperties } from 'ethers/lib/utils';
import useInterval from './useInterval.js';
import { dblClick } from '@testing-library/user-event/dist/click';

function App() {

  //----------------------- Declare variables using State ----------------------

  const [errorMessage, setErrorMessage] = useState();
  const [defaultAccount, setDefaultAccount] = useState('Connect Wallet');
  const [lotteryContract, setLotteryContract] = useState();
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [prizePool, setPrizePool] = useState('0');
  const [amountPlayer, setAmountPlayer] = useState('0');
  const [listPlayerGame, setListPlayerGame] = useState();


  //----------------------------- Update State ---------------------------------

  useEffect(() => {
    updateState()
  }, [lotteryContract])

  const updateState = () => {
    if (lotteryContract) getBalance();
    if (lotteryContract) getAmountPlayer();
    if (lotteryContract) getPlayers();

  }

  // useInterval(()=>{
  //   getBalance();
  //   getAmountPlayer();
  //   getPlayers();
  // }, 500)


  //------------------------ Connect to contract -------------------------------

  const declareContract =  () =>{
  let lotteryAddress = "0x4C1dA878740194Cc71f44A6047307eb7ec035526"; // Contract Rinkeby
  // let lotteryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Contract Localhost

  let tmpProvider = new ethers.providers.Web3Provider(window.ethereum);
  setProvider(tmpProvider);
  let tmpSigner = tmpProvider.getSigner();
  setSigner(tmpSigner);
  let tmpContract = new ethers.Contract(lotteryAddress, lotteryAbi, tmpSigner);
  setLotteryContract(tmpContract);
  }

  //--------------------------- Connect wallet ---------------------------------

  const connectWalletHandler = () => {
    declareContract();
    if (window.ethereum && window.ethereum.isMetaMask) {
      console.log('MetaMask Here!');

      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(result => {
          accountChangedHandler(result[0]);
        })
        .catch(error => {
          setErrorMessage(error.message);

        });

    } else {
      console.log('Need to install MetaMask');
      setErrorMessage('Please install MetaMask browser extension to interact');
    }
  }
  // update account, will cause component re-render
  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount);
  }
  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload();
  }
  // listen for account changes
  window.ethereum.on('accountsChanged', accountChangedHandler);

  window.ethereum.on('chainChanged', chainChangedHandler);

//--------------------------- Get balance --------------------------------------

  const getBalance = async () =>{
    const pot = await lotteryContract.getBalance();
    setPrizePool(parseInt(Object.values(pot)[0], 16));
    console.log("Balance: ", prizePool);
} 

//---------------------- Buy ticket and pick number ticket ---------------------

  const enter = () => {
    let numTicket = document.getElementById("getNumber").value;
    if (numTicket == "") numTicket = Math.floor(Math.random() * 10) + 1;
    const costTicket = ethers.BigNumber.from("5");
    lotteryContract.enter(numTicket, {value: costTicket});
    document.getElementById("getNumber").value = "";
  }
 
//--------------------------- Get amount player one game -----------------------

  const getAmountPlayer = async () =>{
    const cntPlayer = await lotteryContract.getAmountPlayer();
    setAmountPlayer(parseInt(Object.values(cntPlayer)[0], 16));
    console.log("Amount Player: ", amountPlayer);
  }

//----------------- Get list player and number ticket of player ----------------

  const getPlayers = async () =>{
    const listNumberTicket = [];
    let menuPlayers = document.getElementById("listPlayer");
    menuPlayers.innerHTML='';
    let menuNumberTicket = document.getElementById("listNumTicket");
    menuNumberTicket.innerHTML='';
    for(let i = 0; i < amountPlayer; i++){
    const player = await lotteryContract.getPlayers(i);
    const numTicketPlayer = Object.values(player)[1];

    // Create list player
    const newLiPlayer = document.createElement("li");
    newLiPlayer.className = "li-player short-text";
    newLiPlayer.innerHTML = Object.values(player)[0];
    document.getElementById("listPlayer").appendChild(newLiPlayer);

    // Create list number ticket
    const newLiNumberTicket = document.createElement("li");
    newLiNumberTicket.className = "li-number-ticket short-text";
    newLiNumberTicket.innerHTML = parseInt(Object.values(numTicketPlayer)[0], 16);
    document.getElementById("listNumTicket").appendChild(newLiNumberTicket);
    console.log("Number Ticket: ", parseInt(Object.values(numTicketPlayer)[0], 16));
    }
  }

//----------------------------- Pick winner ------------------------------------




//----------------------------------------------------------------------------


  return (
    <div className="main">
      <div className="layout-header">
        <div className="navbar-brand">
          LOTTERY APP
    </div>
        <div className="navbar-end">
          <button onClick={connectWalletHandler} className="connect-wallet short-text">
            {defaultAccount}
          </button>
        </div>
      </div>
      <div className="layout-body">
        <div className="lottery-area">
          <div className="run-lottery">
            <div>
              Giá vé: 5 Wei
        <div className="pay-money">
                <input type="text" placeholder="Chọn số từ 1->10" id="getNumber" className="get-number" />
                <button  onClick={enter}className="get-player bt1">
                  Mua vé
          </button>
              </div>
            </div>
            <div className="pot">
              Tổng giải thưởng:
              <p>{prizePool} tỉ</p>
          </div>
          <button className="bt2">
                  Xổ số
          </button>
          </div>
          <div className="result-lottery">
            Kết quả đợt trước:
            </div>
        </div>
        <div className="participants">
          <div className="amount-players">
            <p style={{color: 'yellow'}}>Người tham gia:  </p> <p style={{color: 'rgb(65, 212, 176)'}}>{amountPlayer}</p>
          </div>
          <div className="player-title">          
          <div className="address-player">&emsp;Địa chỉ người chơi
          <ul id="listPlayer">               
            
          </ul>
          </div>
          <div className="ticket-player">Số đã chọn
            <ul id="listNumTicket">

            </ul>
          </div>
          </div>

          </div>
      </div>
    </div>
  );
}

export default App;
