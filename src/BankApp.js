import { React, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from './Bank.module.css';
import simple_token_abi from './Contracts/bank_app_abi.json';
import Interactions from './Interactions';

// functionalities: Create Account | Check Account Status | Deposit Money | Withdraw Money | Calculate Simple Interest | Show Names | Calculate Future Value

const BankApp = () => {
  // deploy simple token contract and paste deployed contract address here. This value is local ganache chain
  let contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

  // created State variables
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [connButtonText, setConnButtonText] = useState('Connect Wallet');

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [transferHash, setTransferHash] = useState(null);
  const [checkAcc, setCheckAcc] = useState('false');
  const [accStatus, setAccStatus] = useState('');
  const [accbalance, setAccBalance] = useState('');

  const [simpleInterest, setSimpleInterest] = useState('');

  const [names, setNames] = useState([]);

  const [nameInput, setNameInput] = useState('');

  const [futureValue, setFutureValue] = useState('');

  // Function to handle wallet connection
  const connectWalletHandler = () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((result) => {
          accountChangedHandler(result[0]);
          setConnButtonText('Wallet Connected');
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    } else {
      console.log('Need to install MetaMask');
      setErrorMessage('Please install MetaMask browser extension to interact');
    }
  };

  // Function to handle account change
  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount);
    updateEthers();
  };

  // Function to handle chain change
  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload();
  };

  // Listen for account changes
  window.ethereum.on('accountsChanged', accountChangedHandler);

  // Listen for chain changes
  window.ethereum.on('chainChanged', chainChangedHandler);

  // Update ethers provider, signer, and contract
  const updateEthers = () => {
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(tempProvider);

    let tempSigner = tempProvider.getSigner();
    setSigner(tempSigner);

    let tempContract = new ethers.Contract(contractAddress, simple_token_abi, tempSigner);
    setContract(tempContract);
  };

  // Function to create a bank account
  const createAccount = async () => {
    let txt = await contract.createAcc();
    console.log(txt);
    setAccStatus('Your Account is created');
  };

  // Function to check if an account exists
  const checkAccountExists = async () => {
    let txt = await contract.accountExists();
    if (txt == true) {
      setCheckAcc('true');
    }
  };

  // Function to get the account balance
  const AccountBalance = async () => {
    let txt = await contract.accountBalance();
    let balanceNumber = txt.toNumber();
    console.log(balanceNumber);
    setAccBalance('' + balanceNumber);
  };

  // Function to withdraw money from the account
  const WithdrawBalance = async (e) => {
    e.preventDefault();
    let withdrawAmount = e.target.withdrawAmount.value;
    let txt = await contract.withdraw(withdrawAmount);
    console.log(txt);
  };

  // Function to calculate simple interest
  const calculateSimpleInterest = async () => {
    const amount = parseFloat(prompt('Enter the amount:'));
    const interestRate = 0.05; // Assuming 5% interest rate
    const timePeriod = 1; // Assuming 1 year time period

    const interest = (amount * interestRate * timePeriod).toFixed(2);

    setSimpleInterest(interest);
  };

  // Function to show the names
  const showNames = async () => {
    let txt = await contract.getNames();
    setNames(txt);
  };

  // Function to add a name
  const addName = async () => {
    if (nameInput.trim() !== '') {
      await contract.addName(nameInput);
      setNameInput('');
      showNames();
      alert(`Name added: ${nameInput}`);
    } else {
      alert('Please enter a valid name.');
    }
  };

  // Function to calculate the future value
  const calculateFutureValue = async () => {
    const amount = parseFloat(prompt('Enter the total amount:'));
    const interestRate = parseFloat(prompt('Enter the interest rate (in decimal form):'));
    const timePeriod = 5; // Assuming 5 years time period

    const futureVal = (amount * Math.pow(1 + interestRate, timePeriod)).toFixed(2);

    setFutureValue(futureVal);
  };

  // returns JSX Markup that represents UI of the Piggy Bank App
  return (
    <div>
      <h2>PIGGY BANK</h2>
      <button className={styles.button6} onClick={connectWalletHandler}>
        {connButtonText}
      </button>

      <div className={styles.walletCard}>
        <div>
          <h3>Address: {defaultAccount}</h3>
        </div>

        <div>
          <button onClick={AccountBalance}>Account Balance</button>{' '}
          <h3>Bank Balance: {accbalance} </h3>
        </div>

        {errorMessage}
      </div>
      <div className={styles.interactionsCard}>
        <div>
          <h4>New User? Click to Create Account</h4>
          <button onClick={createAccount}>Create Account</button>
          <h4>Check account status</h4>
          <button onClick={checkAccountExists}>Account Status?</button>
          <h4>Account Status:</h4> <h5> {checkAcc}</h5>
        </div>
        <form onSubmit={WithdrawBalance}>
          <h3>Withdraw Money</h3>
          <p>Withdraw Amount</p>
          <input type="number" id="withdrawAmount" min="0" step="1" />
          <button type="submit" className={styles.button6}>
            Withdraw
          </button>
        </form>
        <div>
          <h3>Calculate Simple Interest</h3>
          <button onClick={calculateSimpleInterest}>Calculate</button>
          {simpleInterest && <p>Simple Interest: {simpleInterest}</p>}
        </div>
        <div>
          <h3>Show Names</h3>
          <button onClick={showNames}>Show Names</button>
          {names && (
            <ul>
              {names.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3>Add Name</h3>
          <form onSubmit={addName}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter Name"
            />
            <button type="submit">Add</button>
          </form>
        </div>
        <div>
          <h3>Calculate Future Value</h3>
          <button onClick={calculateFutureValue}>Calculate</button>
          {futureValue && <p>Future Value after 5 years: {futureValue}</p>}
        </div>
      </div>
    </div>
  );
};

export default BankApp;
