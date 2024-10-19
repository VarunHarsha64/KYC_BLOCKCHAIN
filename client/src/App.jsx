import { useState, useEffect } from 'react';
import Web3 from 'web3';
import KYCVerification from './abis/KYCVerification.json';
import { uploadToIPFS } from './pinata';  // Import the Pinata function

function App() {
    const [account, setAccount] = useState('');
    const [aadharNumber, setAadharNumber] = useState('');
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [contract, setContract] = useState(null);
    const [web3, setWeb3] = useState(null);

    useEffect(() => {
        loadBlockchainData();
    }, []);

    const loadBlockchainData = async () => {
        const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
        setWeb3(web3);
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const networkData = KYCVerification.networks[networkId];
        if (networkData) {
            const kycContract = new web3.eth.Contract(KYCVerification.abi, networkData.address);
            setContract(kycContract);
        } else {
            alert('Smart contract not deployed to the detected network.');
        }
    };

    const verifyUser = async () => {
        const userData = { name, dob, aadharNumber, gender };
        const ipfsHash = await uploadToIPFS(userData);  // Upload user data to IPFS
        if (ipfsHash) {
            await contract.methods.verifyUser(aadharNumber, ipfsHash).send({ from: account, gas: 3000000 });
            setIsVerified(true);
        }
    };

    const checkVerification = async () => {
        const verified = await contract.methods.isUserVerified(aadharNumber).call();
        setIsVerified(verified);
    };

    return (
        <div>
            <h1>KYC Verification</h1>
            <p>Connected Account: {account}</p>
            <input type="text" placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="text" placeholder="Enter DOB" value={dob} onChange={(e) => setDob(e.target.value)} />
            <input type="text" placeholder="Enter Aadhar Number" value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)} />
            <input type="text" placeholder="Enter Gender" value={gender} onChange={(e) => setGender(e.target.value)} />
            <button onClick={verifyUser}>Verify User</button>
            <button onClick={checkVerification}>Check Verification</button>
            {isVerified && <p>User is Verified!</p>}
        </div>
    );
}

export default App;
