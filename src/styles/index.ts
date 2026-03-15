type StylesType = {
  container: string;
  innerContainer: string;
  header: string;
  exchangeContainer: string;
  headTitle: string;
  subTitle: string;
  exchangeBoxWrapper: string;
  exchangeBox: string;
  exchange: string;
  amountContainer: string;
  amountInput: string;
  currencyButton: string;
  currencyList: string;
  currencyListItem: string;
  actionButton: string;
  message: string;
  walletButton: string;
  loader: string;
  loaderImg: string;
  loaderText: string;
  balance: string;
  balanceText: string;
  balanceBold: string;
};

export const styles: StylesType = {
  
  container: "flex justify-center min-h-screen sm:px-16 px-6 bg-white",
  innerContainer: "flex justify-between items-center flex-col max-w-[1280px] w-full",
  header: "flex flex-row justify-between items-center w-full sm:py-2 py-1",
  
  exchangeContainer: "flex-1 flex justify-start items-center flex-col w-full mt-0",
  headTitle: "text-gray-900 font-poppins font-black text-5xl tracking-wide mt-2",
  subTitle: "text-gray-600 font-poppins font-medium mt-1 text-lg mb-4 md:text-xl",
  exchangeBoxWrapper: "mt-6 w-full flex justify-center",
  exchangeBox: "relative md:max-w-[700px] md:min-w-[500px] min-w-full max-w-full gradient-border p-[2px] rounded-3xl",
  exchange: "w-full min-h-[350px] bg-white backdrop-blur-[4px] rounded-3xl shadow-lg flex p-6",

  amountContainer: "flex justify-between items-center flex-row w-full min-w-full bg-gray-50 border-[1px] border-gray-200 hover:border-pink-300 min-h-[52px] sm:p-4 p-2 rounded-[16px]",
  amountInput: "w-full flex-1 bg-transparent outline-none font-poppins font-black text-2xl text-gray-800",
  currencyButton: "flex flex-row items-center bg-pink-100 py-2 px-4 rounded-xl font-poppins font-bold text-pink-600 hover:bg-pink-200 transition-colors w-[96px] justify-center",
  currencyList: "absolute z-10 right-0 bg-white border-[1px] border-gray-200 w-full mt-2 rounded-lg min-w-[170px] overflow-hidden shadow-lg",
  currencyListItem: "font-poppins font-medium text-base text-gray-700 hover:text-pink-600 px-5 py-3 hover:bg-pink-50 cursor-pointer transition-colors",

  actionButton: "border-none outline-none px-6 py-2 font-poppins font-bold text-lg rounded-2xl leading-[24px] transition-all min-h-[56px] bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:opacity-90",
  message: "font-poppins font-lg text-gray-700 font-bold mt-7",

  walletButton: "bg-gradient-to-r from-orange-400 to-pink-500 border-none outline-none px-6 py-2 font-poppins font-bold text-lg text-white rounded-3xl leading-[24px] hover:opacity-90 transition-all",

  loader: "flex justify-center items-center flex-col w-full min-h-full",
  loaderImg: "w-56 h-56 object-contain",
  loaderText: "font-poppins font-normal text-gray-500 text-lg text-center mt-10",

  balance: "w-full text-left mt-2 ml-2",
  balanceText: "font-poppins font-normal text-gray-600",
  balanceBold: "font-semibold text-gray-800",
};

export default styles;