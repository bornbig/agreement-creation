import Web3 from 'web3';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserNetwork, setUserWalletConnection } from '../../store/actions/user-action';
import { showNotification } from '../../store/actions/notification-action';
import { NETWORK, NETWORK_LIST } from '../../config/network';
import "./style.css";
import { Modal } from '../modal';

function Header() {
  const [isNetworkSelectorOpen, setIsNetworkSelectorOpen] = useState(false)
    const dispatch = useDispatch();

    const { wallet, chainId, isConnected } = useSelector((state) => state.user);
    const ethereum = window.ethereum;
  

  useEffect(() => {
    checkIfConnected();
  }, []);

  const checkIfConnected = async () => {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if(accounts.length > 0) connectToMetamask();
  }

  const connectToMetamask = async () => {
    try {
      let _accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      let _chainId = await ethereum.request({ method: 'eth_chainId' });

      dispatch(setUserWalletConnection(_accounts[0], _chainId, new Web3(ethereum)))
      dispatch(showNotification("Wallets are connected", dispatch));

      // Account changed
      window.ethereum.on('accountsChanged', (account) => {
        _accounts = account;
        if(_accounts.length == 0){
          dispatch(setUserWalletConnection(null, null, null))
        }else{
          dispatch(setUserWalletConnection(account[0], _chainId, new Web3(ethereum)))
        }
      });

      // Chain Changed
      window.ethereum.on('chainChanged', (chainId) => {
        _chainId = chainId;
        if(NETWORK[chainId]?.name){
          dispatch(setUserWalletConnection(_accounts[0], chainId, new Web3(ethereum)))
        }else{
          dispatch(setUserWalletConnection(_accounts[0], null, null))
        }
      });

    } catch (err) {
      console.error(err);
    }
  };



  const switchNetwork = async (chainId) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      setIsNetworkSelectorOpen(false)
      dispatch(setUserNetwork(chainId))
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className='header'>
      <div className="logo">
        <a href="/">
          <img src="/images/logo.png" alt="" />
        </a>
      </div>
      {isConnected ? (
        <div className='connected'>
          <div className='network-selector' onClick={() => setIsNetworkSelectorOpen(true)}>
            {NETWORK[chainId]?.name || "Select Network"} <i className="arrow down"></i>
          </div>
            <div className='wallet'>{wallet}</div>
        </div>
      ) : (
        <div onClick={connectToMetamask} className="btn connect">Connect to Metamask</div>
      )}

      <Modal isOpen={isNetworkSelectorOpen} closeModal={setIsNetworkSelectorOpen}>
        {NETWORK_LIST.map((network, index) => (
          <div className="network" onClick={() => switchNetwork(network?.id)} key={network?.id}>
            {network?.name}
          </div>
        ))}
      </Modal>
    </div>
  );
}

export default Header;




