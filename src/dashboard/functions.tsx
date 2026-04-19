import { toast, Zoom } from "react-toastify";

const origin = import.meta.env.VITE_ACTUAL_ORIGIN;

export const wait = async (time:number) => await new Promise ((resolve)=>setTimeout(resolve, time))

export const hideInfos = (infos: any, range: number): string => {
    if (!infos || typeof infos !== 'string') {
        return "Not found";
    }

    if (range >= infos.length) {
        return "*".repeat(infos.length);
    }

    const visiblePart = infos.slice(0, infos.length - range);
    const hiddenPart = "*".repeat(5);
    return visiblePart + hiddenPart;
};


export const dropIn = {
    hidden : {
        y : "-100vh",
        opacity : 0
    },
    visible : {
        y : 0,
        opacity : 1,
        transition:{
            type: "tween",
            duration: 0.8,
            ease: "easeInOut"
        }
    },
    exit : {
        y : "100vh",
        opacity : 0
    },
}

export const goTo = (ref:string) => {window.location.href = ref}
export const goToNewBlank = (ref:string) => {window.open(`${origin.slice(0, -1)}${ref}`, '_blank')}

  export const selectedLang = (l:string) => {
    let a = '';
    switch(l){
        case    'العربية':
            a = 'ar';
            break;
        case 'Français':
            a = 'fr';
            break;
        case 'English':
            a='en';
            break
    }return a
}

export const showToast = (message:string, event : "success" | "error") => {
            if(event == "error"){
                toast.error(message,{
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false, 
                  closeOnClick: false,
                  pauseOnHover: false,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                  transition: Zoom,
                })
            }else if(event == "success"){
                toast.success(message,{
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false, 
                  closeOnClick: false,
                  pauseOnHover: false,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                  transition: Zoom,
                })
            }


}

export const usersRoles = (t:any) =>{ 
    return [
        {roleName:t('admin'), roleValue: "admin"},
        {roleName:t('manager'), roleValue: "manager"},
        {roleName:t('deliveryMan'), roleValue: "delivery"},
    ]
}

export const getDate = (
  dateString: string,
  output: "date" | "time"
): string => {
  const dateObj = new Date(dateString);

  if (isNaN(dateObj.getTime())) {
    throw new Error("Date invalide");
  }

  if (output === "date") {
    
    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } else {
    
    return dateObj.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

export const showPhoneTable  = (content:any[], t:any, orderStatus:any, orderExceptions:any, processOrder:any, isExpanded:any) => {

  return (<div className="d-flex flex-column gap-3 m-1">
            {content.slice(0, isExpanded? content.length: 3).map((ord, index) => (
              <div key={index} className="order-card p-3 shadow-sm rounded bg-white">
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('orderId')}:</strong> <p className="fw-bold">{hideInfos(ord.order_id, 30)}</p>
                </div>
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('transactionId')}:</strong> <p className="fw-bold">{hideInfos(ord.transaction_id, 30)}</p>
                </div>
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('date')}:</strong> <p className="fw-bold">{ord.date}</p>
                </div>
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('amount')}:</strong> <p className="fw-bold">{ord.amount}</p>
                </div>
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('status')}:</strong> {ord.status ? orderStatus[1] : orderStatus[0]}
                </div>
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('deficiencies')}:</strong> {ord.exception ? orderExceptions[0] : orderExceptions[1]}
                </div>
                <div className="mt-3">
                  <button className="btn btn-primary w-100" onClick={() => processOrder(ord)}>
                    {t('process')}
                  </button>
                </div>
              </div>
            ))}
          </div>
)

}

export const showDesktopTable  = (content:any[], t:any, orderStatus:any, orderExceptions:any, processOrder:any, isExpanded:any) => {

  return (        <div className="responsive-table">
            <table className="table table-bordered mt-2 orders-table shadow-sm rounded bg-white">
              <thead>
                <tr className="text-muted">
                  <th>{t('orderId')}</th>
                  <th>{t('transactionId')}</th>
                  <th>{t('date')}</th>
                  <th>{t('amount')}</th>
                  <th>{t('status')}</th>
                  <th>{t('deficiencies')}</th>
                  <th>{t('action')}</th>
                </tr>
              </thead>
              <tbody>
                {content.slice(0, isExpanded? content.length: 3).map((ord, index) => (
                  <tr key={index}>
                    <td className="fw-bold">{hideInfos(ord.order_id, 30)}</td>
                    <td className="fw-bold">{hideInfos(ord.transaction_id, 30)}</td>
                    <td>{getDate(ord.date, "date")}</td>
                    <td>{ord.amount}</td>
                    <td className="order-status">{ord.status ? orderStatus[1] : orderStatus[0]}</td>
                    <td className="text-center">{ord.exception ? orderExceptions[0] : orderExceptions[1]}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => processOrder(ord)}>
                        {t('process')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
)

}

export const showDeficienciesDesktopTable = (content: any[], t:any, deficiencyOnClick:any, isExpanded:any) => {

  return(<div className="responsive-table">
            <table className="table table-bordered mt-2 orders-table shadow-sm rounded bg-white">
              <thead>
                <tr className="text-muted">
                        <th className="text-muted">{t('orderId')} </th>
                        <th className="text-muted">{t('productType')}</th>
                        <th className="text-muted">{t('category')}</th>
                        <th className="text-muted">{t('ref')}</th>
                        <th className="text-muted">{t('name')}</th>
                        <th className="text-muted">{t('size')}</th>
                        <th className="text-muted">{t('quantity')}</th>
                        <th className="text-muted">{t('action')}</th>
                </tr>
              </thead>
              <tbody>
                {content.slice(0, isExpanded? content.length: 3).map((ord, index) => (
                  <tr key={index}>
                            <td>{hideInfos(ord.order.order_id, 30)}</td>
                            <td>{ord.product_type}</td>
                            <td>{ord.product_category}</td>
                            <td>{ord.product_ref}</td>
                            <td>{ord.product_name}</td>
                            <td>{ord.product_size}</td>
                            <td>{ord.delta_quantity}</td>
                            <td><button className="btn btn-primary" onClick={()=>{deficiencyOnClick(ord)}}>{t('processDeficiency')} </button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

  )

}

export const showDeficienciesPhoneTable = (content: any[], t:any, deficiencyOnClick:any, isExpanded:any) => {

  return(<div className="d-flex flex-column gap-3 m-1">
            {content.slice(0, isExpanded? content.length: 3).map((ord, index) => (
              <div key={index} className="order-card p-3 shadow-sm rounded bg-white">
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('orderId')}:</strong> <p className="fw-bold">{hideInfos(ord.order.order_id, 25)}</p>
                </div>
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('productType')}:</strong> <p className="fw-bold">{ord.product_type}</p>
                </div>
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('category')}:</strong> <p className="fw-bold">{ord.product_category}</p>
                </div>
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('ref')}:</strong> <p className="fw-bold">{ord.product_ref}</p>
                </div>
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('name')}:</strong> <p className="fw-bold">{ord.product_name}</p>
                </div>
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('size')}:</strong> <p className="fw-bold">{ord.product_size}</p>
                </div>
                <div className="my-1 d-flex flex-row justify-content-between">
                  <strong className="text-muted">{t('quantity')}:</strong> <p className="fw-bold">{ord.delta_quantity}</p>
                </div>
                <div className="mt-3">
                  <button className="btn btn-primary w-100" onClick={() => deficiencyOnClick(ord)}>
                    {t('process')}
                  </button>
                </div>
              </div>
            ))}
          </div>

  )

}