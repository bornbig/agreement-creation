import Web3 from 'web3';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserWalletConnection, setWalletDisconnect, submitIdToken, updateUserBalance } from '../../store/actions/user-action';
import { showNotification } from '../../store/actions/notification-action';
import "./style.css";
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { DEFAULT_NETWORK, WEB3AUTH_KEY } from '../../config/config';
import { SendToken } from '../send-token';
import { PrivateKeyModel } from './private-key';

let web3auth = null;
function Header() {
  const dispatch = useDispatch();
  const { wallet, chainId, isConnected, userInfo, balance } = useSelector((state) => state.user);
  const [isSendTokenOpen, setIsSendTokenOpen] = useState(false)
  const [showPrivateKeyModel, setShowPrivateKeyModel] = useState(false);
  const [privateKey, setPrivateKey] = useState(false);

  const web3AuthInit = async () => {
    web3auth = new Web3Auth({
      clientId: WEB3AUTH_KEY, // Get your Client ID from Web3Auth Dashboard
      web3AuthNetwork: "mainnet", // mainnet, aqua,  cyan or testnet
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: DEFAULT_NETWORK,
        rpcTarget: "https://polygon-mainnet.g.alchemy.com/v2/ip-A-N0sVOSyjzTrDSODvODdTAzBvK-4", // This is the public RPC we have added, please pass on your own endpoint while creating an app
      },
      uiConfig: {
        theme: "light",
        appLogo: "https://web3auth.io/images/w3a-L-Favicon-1.svg", // Your App Logo Here
      },
      // authMode: "WALLET"
    });
  
    const openloginAdapter = new OpenloginAdapter({
      loginSettings: {
        mfaLevel: "mandatory", // Pass on the mfa level of your choice: default, optional, mandatory, none
      },
      adapterSettings: {
        whiteLabel: {
          name: "woople",
          logoLight: "https://app.woople.io/images/Woople%20logo-02.png",
          logoDark: "https://app.woople.io/images/Woople%20logo-02.png",
          defaultLanguage: "en",
          dark: false, // whether to enable dark mode. defaultValue: false
        },
      }
    });
  
    web3auth.configureAdapter(openloginAdapter);
    
    await web3auth.initModal({
      modalConfig: {
        [WALLET_ADAPTERS.OPENLOGIN]: {
          label: "openlogin",
          loginMethods: {
            twitter: {
              name: 'twitter',
              showOnModal: false,
            },
            facebook: {
              name: 'facebook',
              showOnModal: false,
            },
            github: {
              name: 'github',
              showOnModal: false,
            },
            reddit: {
              name: 'reddit',
              showOnModal: false,
            },
            discord: {
              name: 'discord',
              showOnModal: false,
            },
            twitch: {
              name: 'twitch',
              showOnModal: false,
            },
            apple: {
              name: 'apple',
              showOnModal: false,
            },
            line: {
              name: 'line',
              showOnModal: false,
            },
            kakao: {
              name: 'kakao',
              showOnModal: false,
            },
            linkedin: {
              name: 'linkedin',
              showOnModal: false,
            },
            weibo: {
              name: 'weibo',
              showOnModal: false,
            },
            wechat: {
              name: 'wechat',
              showOnModal: false,
            },
            email_passwordless: {
              name: 'email_passwordless',
              showOnModal: false
            },
            sms_passwordless: {
              name: 'sms_passwordless',
              showOnModal: false
            }
          },
          // setting it to false will hide all social login methods from modal.
          showOnModal: true,
        },
      },
    });
  }
  

  useEffect(() => {
    checkIfConnected();
  }, []);

  const checkIfConnected = async () => {
    await web3AuthInit();
    if(web3auth?.connected){
      openModel();
    }
  }

  const openModel = async () => {
    try{

      const provider = await web3auth.connect();
      
      const info = await web3auth.getUserInfo();
      
      const web3 = new Web3(provider);

      let _accounts = await web3.eth.getAccounts();

      if(info.idToken){
        await submitIdToken(info.idToken, _accounts[0]);
      }

      dispatch(setUserWalletConnection(_accounts[0], "0x89", web3, info));
      triggerUpdateBalance(_accounts[0]);

    }catch(e){
      console.log(e);
      dispatch(showNotification("Error while integrating Web3Auth", dispatch, "danger"));
    }
  }

  const triggerUpdateBalance = async (wallet) => {
    dispatch(await updateUserBalance(wallet));
  }

  const logout = async () => {
    await web3auth.logout();
    dispatch(setWalletDisconnect());
  }

  async function showPrivateKey (){

    const privateKey = await web3auth.provider.request({
      method: "eth_private_key"
    });
    
    setPrivateKey(privateKey);
    setShowPrivateKeyModel(true);
  }

  const textcopying = () => {
    navigator.clipboard.writeText(wallet)
    dispatch(showNotification("Copied to clipBoard", dispatch));
  }

  return (
    <div className='header'>
      <div className="logo">
        <a href="/">
          <img src="/images/Woople logo-02.png" alt="" />
        </a>
      </div>
      {isConnected ? (
        <div className='btn-wrap'>
          <div className="preview">
            <img src="/images/wallet.png" alt="" />
            <span className='balance'>${balance.usdBalance}</span>
          </div>
          
          <div className='connected'>
            {userInfo.email ?
              <div className="email">{userInfo.email}</div>
              :
              <div className='wallet p20px'>
                  <img src="/images/copy.png" alt="" onClick={() => textcopying()} />
                  <span>{wallet}</span>
              </div>
            }
              <div className="info">
                <div className="balance">${balance.usdBalance}</div>
                <div className="label">Balance</div>
                {userInfo.email &&
                  <div className='wallet'>
                    <img src="/images/copy.png" alt="" onClick={() => textcopying()} />
                    <span>{wallet}</span>
                  </div>
                }
                <a className='btnPrivateKey' href="/add-funds">Add Funds</a>

                <div className='logout b' onClick={() => setIsSendTokenOpen(true)}>Send Token</div>
                <div className='logout b' onClick={showPrivateKey}>Private key</div>
                <div className="logout" onClick={logout}>Logout</div>
              </div>
          </div>
          <div className="masked"></div>
        </div>
        ) : (
          <div onClick={openModel} className="btn connect">Login</div>
        )}
        <SendToken isOpen={isSendTokenOpen} closeModal={setIsSendTokenOpen} triggerUpdateBalance={triggerUpdateBalance} />
        <PrivateKeyModel privateKey={privateKey} isOpen={showPrivateKeyModel} closeModal={setShowPrivateKeyModel} />
    </div>
  );
}

export default Header;




