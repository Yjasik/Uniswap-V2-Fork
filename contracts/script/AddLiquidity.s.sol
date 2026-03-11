// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MyToken} from "../src/tokens/MyToken.sol";
import {WETH9} from "../src/tokens/WETH9.sol";

address constant UNISWAP_V2_ROUTER = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;

interface IUniswapV2Router02 {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

contract AddLiquiditySimple is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        address weth = 0x17d88f10916A398131c248ae5C025ce93809C3f5;
        address usdc = 0x044A8172a9e9A5732A3aD1B3385013f4dDCD7D2d;
        
        IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_V2_ROUTER);
        
        // 1. Проверяем баланс ETH
        console.log("Deployer ETH balance:", deployer.balance);
        require(deployer.balance >= 0.01 ether, "Not enough ETH");
        
        // 2. Проверяем баланс USDC
        uint256 usdcBalance = MyToken(usdc).balanceOf(deployer);
        console.log("USDC balance:", usdcBalance);
        require(usdcBalance >= 10 * 10**18, "Not enough USDC");
        
        // 3. Одобряем USDC для Router (ВАЖНО!)
        MyToken(usdc).approve(UNISWAP_V2_ROUTER, 10 * 10**18);
        console.log("USDC approved");
        
        // 4. Добавляем ликвидность
        console.log("Adding liquidity to USDC/WETH pair...");
        console.log("Sending 0.01 ETH and 10 USDC");
        
        (uint amountUsdc, uint amountWeth, uint liquidity) = router.addLiquidityETH{value: 0.01 ether}(
            usdc,           
            10 * 10**18,    
            0,              
            0,              
            deployer,       
            block.timestamp + 1 hours
        );
        
        console.log("  Liquidity added successfully!");
        console.log("  USDC added:", amountUsdc);
        console.log("  WETH added:", amountWeth);
        console.log("  LP tokens received:", liquidity);
        
        console.log("Pair address: 0xaB22F32dC18Ac80e6A65B079d72f18040e2cC863");

        vm.stopBroadcast();
    }
}