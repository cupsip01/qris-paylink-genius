
interface PaymentAmountProps {
  amount: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const PaymentAmount = ({ amount }: PaymentAmountProps) => {
  return (
    <div className="text-center mb-4">
      <span className="text-gray-500 text-sm">Amount</span>
      <p className="text-3xl font-bold">{formatCurrency(amount)}</p>
    </div>
  );
};

export default PaymentAmount;
export { formatCurrency };
