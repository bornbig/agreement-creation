import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showNotification } from "../store/actions/notification-action";
import { getPaymentList } from "../store/actions/payment-action";
import { useNavigate } from "react-router-dom";
import { PaymentWidget } from "../components/payment-widget";
import { CANCELLED, CREATED, DELIVERD, DISPUTED, DISPUTE_RESOLVED_BOTH_WON, DISPUTE_RESOLVED_CLIENT_WON, DISPUTE_RESOLVED_SERVICE_WON, RELEASED, SIGNED } from "../config/status-constant";

export function Home(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [payments, setPayments] = useState(null);
    const { isConnected, userInfo, wallet, web3, chainId } = useSelector((state) => state.user);

    useEffect(() => {
        getMyAgreements();
    }, [wallet]);

    const getMyAgreements = async() => {
        if(!payments && wallet){
            const _payments = await getPaymentList(userInfo?.email || wallet);
            setPayments(_payments);
        }
    }

    const takeMeToAgreement = (payment) => {
        if(payment?.token_id){
            navigate(`/sbt/${payment?.receiverContract}/${payment?.tokenId}`);
        }else{
            navigate(`/payment/${payment.paymentid}`);
        }
    }

    const isSender = (payment) => {
        return payment.senderWallet == wallet || payment.senderEmail == userInfo.email
    }

    const getStatus = (payment) => {
        switch(parseInt(payment.status || 0)){
            case 0:
                return "CREATED"
                break;
            case CREATED:
                return "CREATED"
                break;
            case SIGNED:
                return "PENDING DELIVERY"
                break;
            case CANCELLED:
                return "CANCELLED"
                break;
            case DELIVERD:
                return "NEW DELIVERY"
                break;
            case RELEASED:
                return "COMPLETED"
                break;
            case DISPUTED:
                return "DISPUTED"
                break;
            case DISPUTE_RESOLVED_BOTH_WON:
                return "DISPUTE RESOLVED"
                break;
            case DISPUTE_RESOLVED_CLIENT_WON:
                return "DISPUTE RESOLVED"
                break;
            case DISPUTE_RESOLVED_SERVICE_WON:
                return "DISPUTE RESOLVED"
                break;
        }
    }

    return (
        <>
            <section className="hero">
                <div className="container">
                    <div className="hero-heading">
                        <div className="heading"><span id="spin"></span> Payment</div>
                        <div className="slogan">the simplest way to send and receive funds in minutes with just your email!</div>
                    </div>
                    <PaymentWidget />
                </div>
            </section>
                <section className="paymentList mt-4">
                    {payments?.length > 0 && web3 &&
                        <div className="container">
                            <div className="d-flex-between">
                                {payments?.slice(0, 12)?.map((payment, index) => (
                                    <div className="box-payment" onClick={() => takeMeToAgreement(payment)} key={index}>
                                        <div className="amount">
                                            ${payment.amount}
                                        </div>
                                        <div className="user">
                                            {isSender(payment)?
                                                (payment.receiverEmail || payment.receiverWaller)
                                                : (payment.senderEmail || payment.senderWaller)}
                                        </div>
                                        <div className="flex-tag">
                                            <div className="mode">
                                                {isSender(payment)? "SENDING" : "RECEIVING"}
                                            </div>
                                            <div className="status">
                                                {getStatus(payment)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                </section>
        </>
    )
}