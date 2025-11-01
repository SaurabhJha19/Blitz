
import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Wifi, Cpu } from 'lucide-react';

const DebitCard = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email || 'CARDHOLDER NAME';
  
  const cardNumber = '4000 1234 5678 9010';
  const expiryDate = '12/28';
  const cvv = '123';

  return (
    <div className="w-full max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-gray-800 to-black text-white h-56 rounded-xl shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            
            <div className="flex justify-between items-center">
                <span className="text-2xl font-bold italic">Bank</span>
                <Wifi size={28} />
            </div>

            <div className="flex justify-between items-center">
                <Cpu size={40} />
                <p className="font-mono text-xl tracking-widest">{cardNumber}</p>
            </div>

            <div className="flex justify-between items-end text-sm">
                <div>
                    <p className="font-light text-gray-400">Card Holder</p>
                    <p className="font-medium tracking-wider uppercase truncate">{userName}</p>
                </div>
                <div className="text-right">
                    <p className="font-light text-gray-400">Expires</p>
                    <p className="font-medium tracking-wider">{expiryDate}</p>
                </div>
                 <div className="text-right">
                    <p className="font-light text-gray-400">CVV</p>
                    <p className="font-medium tracking-wider">{cvv}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DebitCard;
