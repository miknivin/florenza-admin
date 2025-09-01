import React from 'react';
import RadioDropDown from './RadioDropDown';

// Define the type for the props
interface OrderHeaderProps {
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  orderId: string;
  delhiveryStatus?: string;
  delhiveryError?: boolean;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ orderNumber, orderDate, orderStatus, orderId, delhiveryStatus, delhiveryError }) => {
  return (
    <div className='flex justify-between'>
      <div className="flex justify-start item-start space-y-2 flex-col">
        <h1 className="text-3xl lg:text-4xl font-semibold leading-7 lg:leading-9 text-gray-800 dark:text-gray-100">
          Order #{orderNumber}
        </h1>
        <p className="text-base dark:text-gray-300 font-medium leading-6 text-gray-600">
          {orderDate}
        </p>
      </div>
      {/* Show Delhivery status if available and no error, else show manual dropdown */}
      {delhiveryStatus && !delhiveryError ? (
        <div className="flex items-center justify-center h-full">
          <span className="inline-block px-6 py-3 rounded-lg bg-blue-700 text-white text-base font-semibold shadow-md text-center min-w-[220px]">
           {delhiveryStatus}
          </span>
        </div>
      ) : (
        <RadioDropDown orderStatus={orderStatus} orderId={orderId} />
      )}
    </div>
  );
};

export default OrderHeader;