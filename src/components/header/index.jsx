import Web3 from 'web3';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SET_USER, initiateAccount, setUserWalletConnection, setWalletDisconnect, updateUserBalance, verifyWeb3Auth } from '../../store/actions/user-action';
import { showNotification } from '../../store/actions/notification-action';
import "./style.css";
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { DEFAULT_NETWORK, RPC_URL, WEB3AUTH_KEY } from '../../config/config';
import { SendToken } from '../send-token';
import { PrivateKeyModel } from './private-key';
import { DEFAULT_ECDSA_OWNERSHIP_MODULE, ECDSAOwnershipValidationModule, SessionKeyManagerModule } from '@biconomy/modules';
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
import { ChainId } from "@biconomy/core-types"
import { Bundler } from '@biconomy/bundler';
import { Wallet, providers } from 'ethers';
import { BiconomyPaymaster } from '@biconomy/paymaster';
import { sendTransaction } from '../../helpers/utils';
import { CONTRACT } from "../../config/config";
import { Link, useNavigate } from 'react-router-dom';

let web3auth = null;
function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wallet, chainId, isConnected, userInfo, balance } = useSelector((state) => state.user);
  const [isloggingIn, setIsLoggingIn] = useState(false);
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
        rpcTarget: RPC_URL, // This is the public RPC we have added, please pass on your own endpoint while creating an app
      },
      // uiConfig: {
      //   theme: "light",
      //   appLogo: "https://app.woople.io/images/Woople%20logo-02.png", // Your App Logo Here
      // },
      // authMode: "WALLET"
    });
  
    const openloginAdapter = new OpenloginAdapter({
      loginSettings: {
        mfaLevel: "mandatory", // Pass on the mfa level of your choice: default, optional, mandatory, none
      },
      adapterSettings: {
        // whiteLabel: {
        //   name: "woople",
        //   logoLight: "https://app.woople.io/images/Woople%20logo-02.png",
        //   logoDark: "https://app.woople.io/images/Woople%20logo-02.png",
        //   defaultLanguage: "en",
        //   dark: false, // whether to enable dark mode. defaultValue: false
        // },
        mfaSettings: {
          deviceShareFactor: {
            enable: false,
          },
          backUpShareFactor: {
            enable: false,
          },
          socialBackupFactor: {
            enable: true,
          },
          passwordFactor: {
            enable: false,
          },
        }
      }
    });
  
    web3auth.configureAdapter(openloginAdapter);
    
    setIsLoggingIn(true);
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
    setIsLoggingIn(false);
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
    setIsLoggingIn(true);
    try{

      const provider = await web3auth.connect();
      
      const info = await web3auth.getUserInfo();
      
      const web3 = new Web3(provider);

      let _accounts = await web3.eth.getAccounts();
      let smartWallet = _accounts[0];
      let smartAccount = null;

      try{
        const privateKey = await web3auth.provider.request({
          method: "eth_private_key"
        });
        smartAccount = await getSmartAccountAddress(privateKey, web3);
        smartWallet = await smartAccount.getAccountAddress();
      }catch(e){}

      triggerUpdateBalance(smartWallet);
      callApisSequentially(info, _accounts[0], web3);

      dispatch(setUserWalletConnection(smartWallet, "0x89", web3, smartAccount, info));

    }catch(e){
      console.log(e);
      dispatch(showNotification("Error while integrating Web3Auth", dispatch, "danger"));
    }
    setIsLoggingIn(false);
  }

  const callApisSequentially = async (info, wallet, web3) => {
    const signedMessage = (await web3.eth.personal.sign(info?.email, wallet));
    const data = await initiateAccount(info?.email, signedMessage);
    dispatch({type: SET_USER, data});

    if(info.idToken){
      await verifyWeb3Auth(info.idToken);
    }
  }

  const getSmartAccountAddress = async (privateKey) => {

    const wallet = new Wallet(privateKey, new providers.JsonRpcProvider(RPC_URL));

    const bundler = new Bundler({
      bundlerUrl: 'https://bundler.biconomy.io/api/v2/137/3BAZr7P_T.d0f24b3c-630b-4042-8b80-c0c341480796',     
      chainId: ChainId.POLYGON_MAINNET,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    })

    const paymaster = new BiconomyPaymaster({
      paymasterUrl: "https://paymaster.biconomy.io/api/v1/137/3BAZr7P_T.d0f24b3c-630b-4042-8b80-c0c341480796"
    })
    
    const module = await ECDSAOwnershipValidationModule.create({
      signer: wallet,
      moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
    });
    
    let biconomySmartAccount = await BiconomySmartAccountV2.create({
      rpcUrl: RPC_URL,
      signer: wallet,
      chainId: ChainId.POLYGON_MAINNET,
      bundler: bundler, 
      paymaster: paymaster,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      defaultValidationModule: module,
      activeValidationModule: module
    });

    return biconomySmartAccount;
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

  const loader = () => {
    return (<div className="btn-loader">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>);
}

  return (
    <div className="container">
      <div className='header'>
        <div className="logo">
          <Link to="/">
            <img src="/images/logo-n.png" alt="" />
          </Link>
        </div>
        <div className='link-flex'>
          <div className='links-top'>
            <a className='link' href='mailto:abhishek@woople.io'>Contact</a>
            <a className='link' href='https://x.com/xwoople' target='_blank'>Twitter</a>
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
                    <Link className='btnPrivateKey' to="/add-funds">Manage Wallet</Link>

                    <div className='logout b' onClick={() => setIsSendTokenOpen(true)}>Send Token</div>
                    <div className='logout b' onClick={showPrivateKey}>Private key</div>
                    <div className="logout" onClick={logout}>Logout</div>
                  </div>
              </div>
              <div className="masked"></div>
            </div>
            ) : (
              <div onClick={openModel} className="btn connect"> {isloggingIn ? loader() : "Login"}</div>
            )}
        </div>
          <SendToken isOpen={isSendTokenOpen} closeModal={setIsSendTokenOpen} triggerUpdateBalance={triggerUpdateBalance} />
          <PrivateKeyModel privateKey={privateKey} isOpen={showPrivateKeyModel} closeModal={setShowPrivateKeyModel} />
      </div>
    </div>
  );
}

export default Header;