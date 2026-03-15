// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MyToken} from "../src/tokens/MyToken.sol";
import {WETH9} from "../src/tokens/WETH9.sol";

// Адреса уже развернутых контрактов Uniswap V2 в Sepolia
address constant UNISWAP_V2_FACTORY = 0x7E0987E5b3a30e3f2828572Bb659A548460a3003;
address constant UNISWAP_V2_ROUTER = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;

interface IUniswapV2Factory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

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

contract DeployTokensScript is Script {
    WETH9 public weth;
    MyToken public usdc;
    MyToken public dai;
    IUniswapV2Router02 public router;
    address public deployer;
    
    address public pairWethUsdc;
    address public pairWethDAI;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        deployContracts();
        createPairs();
        addLiquidity();

        vm.stopBroadcast();

        logAddresses();
    }

    function deployContracts() internal 

        weth = new MyToken("WETH", "WETH", 1000000);
        dai = new MyToken("DAI", "DAI", 1000000);
        console.log("USDC deployed at:", address(usdc));
        console.log("DAI deployed at:", address(dai));

        router = IUniswapV2Router02(UNISWAP_V2_ROUTER);
    }

    function createPairs() internal {
        IUniswapV2Factory factory = IUniswapV2Factory(UNISWAP_V2_FACTORY);

        // Создание пар
        pairWethUsdc = factory.createPair(address(usdc), address(weth));
        console.log("USDC/WETH pair created at:", pairWethUsdc);

        pairWethDAI = factory.createPair(address(dai), address(weth));
        console.log("DAI/WETH pair created at:", pairWethDAI);
    }

    function addLiquidity() internal {
        // Конвертируем ETH в WETH для первой пары (0.01 ETH)
        weth.deposit{value: 0.01 ether}();
        console.log("Converted 0.01 ETH to WETH");
        
        // Переводим токены создателю
        usdc.transfer(deployer, 1000 * 10**18);
        dai.transfer(deployer, 1000 * 10**18);
        console.log("Transferred test tokens to deployer");
        
        // Одобряем токены для Router
        usdc.approve(UNISWAP_V2_ROUTER, 1000 * 10**18);
        dai.approve(UNISWAP_V2_ROUTER, 1000 * 10**18);
        console.log("Approved tokens for Router");
        
        // Добавляем ликвидность в USDC/WETH
        addLiquidityForPair(usdc, 1000 * 10**18, "USDC/WETH");
        
        // Конвертируем еще ETH для второй пары
        weth.deposit{value: 0.01 ether}();
        console.log("Converted another 0.01 ETH to WETH");
        
        // Добавляем ликвидность в DAI/WETH
        addLiquidityForPair(dai, 1000 * 10**18, "DAI/WETH");
    }

    function addLiquidityForPair(MyToken token, uint tokenAmount, string memory pairName) internal {
        (uint amountToken, uint amountETH, uint liquidity) = router.addLiquidityETH{value: 0.01 ether}(
            address(token),
            tokenAmount,
            0,
            0,
            deployer,
            block.timestamp + 1 hours
        );
        
        console.log("Liquidity added to", pairName);
        console.log("  Token added:", amountToken);
        console.log("  ETH added:", amountETH);
        console.log("  LP tokens received:", liquidity);
    }

    function logAddresses() internal view {
        console.log("");
        console.log("=== ADDRESSES TO COPY TO FRONTEND ===");
        console.log("WETH_ADDRESS:", address(weth));
        console.log("USDC_ADDRESS:", address(usdc));
        console.log("DAI_ADDRESS:", address(dai));
        console.log("PAIR_WETH_USDC_ADDRESS:", pairWethUsdc);
        console.log("PAIR_WETH_DAI_ADDRESS:", pairWethDAI);
        console.log("======================================");
    }
}