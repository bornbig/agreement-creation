import Web3 from 'web3';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUSDTBalance, setUserNetwork, setUserWalletConnection, setWalletDisconnect, submitIdToken } from '../../store/actions/user-action';
import { showNotification } from '../../store/actions/notification-action';
import { NETWORK, NETWORK_LIST } from '../../config/network';
import "./style.css";
import { Modal } from '../modal';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { WEB3AUTH_KEY } from '../../config/config';

let web3auth = null;
function Header() {
  const dispatch = useDispatch();
  const { wallet, chainId, isConnected, userInfo } = useSelector((state) => state.user);
  const [balance, setbalance] = useState(false);

  const web3AuthInit = async () => {
    web3auth = new Web3Auth({
      clientId: WEB3AUTH_KEY, // Get your Client ID from Web3Auth Dashboard
      web3AuthNetwork: "testnet", // mainnet, aqua,  cyan or testnet
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x13881",
        rpcTarget: "https://polygon-mumbai.g.alchemy.com/v2/BhT_VC37fxArcOzOvI9VxwDwPiOjoleR", // This is the public RPC we have added, please pass on your own endpoint while creating an app
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
          name: "Pentonium",
          logoLight: "https://pentonium.com/images/logo.png",
          logoDark: "https://pentonium.com/images/logo.png",
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
        submitIdToken(info.idToken, _accounts[0])
      }

      dispatch(setUserWalletConnection(_accounts[0], "0x13881", web3, info));

      updateBalance(_accounts[0]);

    }catch(e){
      console.log(e);
    }
  }

  const logout = async () => {
    await web3auth.logout();
    dispatch(setWalletDisconnect());
  }

  const updateBalance = async (_wallet) => {
    if(_wallet){
      const balanceResponse = await getUSDTBalance(_wallet);

      const humanReadableBalance = balanceResponse.result / (10 ** 6);

      setbalance(humanReadableBalance);
    }
  }

  async function showPrivateKey (){

    const privateKeyDiv = document.querySelector('.btnPrivateKey');

    const privateKey = await web3auth.provider.request({
      method: "eth_private_key"
    });

    if (privateKeyDiv.innerHTML === 'Private key') {
        privateKeyDiv.innerHTML = `
        <div className='privatekey' onClick="navigator.clipboard.writeText('${await privateKey}')">
        <span>Copy<span/>
            <img src="https://cdn-icons-png.flaticon.com/512/1621/1621635.png" alt="" />
        </div>`;

    } else {
      privateKeyDiv.innerHTML = 'Private key';

    }
  }

  return (
    <div className='header'>
      <div className="logo">
        <a href="/">
          <img src="/images/logo.png" alt="" />
        </a>
      </div>
      {isConnected ? (
          <div className='connected'>
              <div className='wallet'>
                <img src="https://cdn-icons-png.flaticon.com/512/1621/1621635.png" alt="" onClick={() => navigator.clipboard.writeText(wallet)} />
                <span>{wallet}</span>
              </div>
              <div className="info">
                <div className="balance">${balance || 0}</div>
                <div className="label">Balance</div>
                <div className='btnPrivateKey' onClick={showPrivateKey}>Private key</div>
                <div className="logout" onClick={logout}>Logout</div>
              </div>
          </div>
        ) : (
          <div onClick={openModel} className="btn connect">Login</div>
        )}
    </div>
  );
}

export default Header;




