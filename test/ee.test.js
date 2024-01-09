const EternalEntities = artifacts.require("EternalEntities");
const { time, BN } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { expect } = require('chai');

contract('ee public sale tests', (accounts) =>{
    
    it('Should fail: try to mint when minting not active (not started)', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.PublicMint(3, {from: accounts[1], value: 30000000000000000})
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Public minting is not active", "The error message should contain 'Public minting is not active'");
        }
    });

    it('should fail: try to mint more than allowed in single transaction', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.TogglePublicSaleStarted();
            await eeInstance.PublicMint(4, {from: accounts[1], value: 40000000000000000})
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Cannot mint more than allowed", "The error message should contain 'Cannot mint more than allowed'");
        }
    });

    it('should fail: try to mint with not enough eth send', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.PublicMint(1, {from: accounts[1], value: 1000000000000000})
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Not enough eth send", "The error message should contain 'Not enough eth send'");
        }
    });

    it('Should fail: try to transfer eth as non owner', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.TransferEth({from: accounts[1]})
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Ownable: caller is not the owner", "The error message should contain 'Ownable: caller is not the owner'");
        }
    });

    it('Should fail: try to set base uri as non owner', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.SetBaseUri("test.lol", {from: accounts[1]})
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Ownable: caller is not the owner", "The error message should contain 'Ownable: caller is not the owner'");
        }
    });

    it('Should fail: try to transfer eth when 0 available', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.TransferEth({from: accounts[0]})
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "No eth present", "The error message should contain 'No eth present'");
        }
    });

    it('Should succeed: Mint 1 nft', async() =>{
        const eeInstance = await EternalEntities.deployed();

        initBalanceOfAccount1 = await web3.eth.getBalance(accounts[1]);
        initBalanceOfEeInstances = await web3.eth.getBalance(eeInstance.address);
        expect(initBalanceOfEeInstances).to.be.bignumber.equal(web3.utils.toBN('0'));

        await eeInstance.PublicMint(1, {from: accounts[1], value: 10000000000000000});
        
        afterBalanceOfAccount1 = await web3.eth.getBalance(accounts[1]);
        afterBalanceOfEeInstances = await web3.eth.getBalance(eeInstance.address);
        expect(afterBalanceOfAccount1).to.be.bignumber.lessThan(web3.utils.toBN(initBalanceOfAccount1).sub(web3.utils.toBN('10000000000000000')));
        expect(afterBalanceOfEeInstances).to.be.bignumber.equal(web3.utils.toBN('10000000000000000'));

        nftBalanceOfAccount1 = await eeInstance.balanceOf(accounts[1]);
        expect(nftBalanceOfAccount1).to.be.bignumber.equal(web3.utils.toBN('1'));
        ownerOfNft1 = await eeInstance.ownerOf(1);
        expect(ownerOfNft1).equal(accounts[1]);
        nftUri = await eeInstance.tokenURI(1);
        expect(nftUri).equal('https://test.com/api/1');
    });

    it('Should succeed: Mint 2 additional nfts', async() =>{
        const eeInstance = await EternalEntities.deployed();

        initBalanceOfAccount1 = await web3.eth.getBalance(accounts[1]);
        initBalanceOfEeInstances = await web3.eth.getBalance(eeInstance.address);
        expect(initBalanceOfEeInstances).to.be.bignumber.equal(web3.utils.toBN('10000000000000000'));

        await eeInstance.PublicMint(2, {from: accounts[1], value: 20000000000000000});
        
        afterBalanceOfAccount1 = await web3.eth.getBalance(accounts[1]);
        afterBalanceOfEeInstances = await web3.eth.getBalance(eeInstance.address);
        expect(afterBalanceOfAccount1).to.be.bignumber.lessThan(web3.utils.toBN(initBalanceOfAccount1).sub(web3.utils.toBN('20000000000000000')));
        expect(afterBalanceOfEeInstances).to.be.bignumber.equal(web3.utils.toBN(initBalanceOfEeInstances).add(web3.utils.toBN('20000000000000000')));

        nftBalanceOfAccount1 = await eeInstance.balanceOf(accounts[1]);
        expect(nftBalanceOfAccount1).to.be.bignumber.equal(web3.utils.toBN('3'));
        
        ownerOfNft1 = await eeInstance.ownerOf(1);
        expect(ownerOfNft1).equal(accounts[1]);
        nftUri = await eeInstance.tokenURI(1);
        expect(nftUri).equal('https://test.com/api/1');

        ownerOfNft2 = await eeInstance.ownerOf(2);
        expect(ownerOfNft2).equal(accounts[1]);
        nftUri2 = await eeInstance.tokenURI(2);
        expect(nftUri2).equal('https://test.com/api/2');

        ownerOfNft3 = await eeInstance.ownerOf(3);
        expect(ownerOfNft3).equal(accounts[1]);
        nftUri3 = await eeInstance.tokenURI(3);
        expect(nftUri3).equal('https://test.com/api/3');

        let totalSupply = await eeInstance.totalSupply()
        expect(totalSupply).to.be.bignumber.equal(web3.utils.toBN('3'));
        let maxSupply = await eeInstance.maxSupply.call()
        expect(maxSupply).to.be.bignumber.equal(web3.utils.toBN('10'));
    });

    it('Should succeed: set base uri as owner', async() =>{
        const eeInstance = await EternalEntities.deployed();

        let nftUri = await eeInstance.tokenURI(1);
        expect(nftUri).equal('https://test.com/api/1');

        await eeInstance.SetBaseUri("https://lol.lol/api/", {from: accounts[0]})
        let nftUriAfter = await eeInstance.tokenURI(1);
        expect(nftUriAfter).equal('https://lol.lol/api/1');
    });

    it('should fail: try to mint more than total allowed for single address', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.PublicMint(1, {from: accounts[1], value: 10000000000000000});
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Mint exceeds max allowed per address", "The error message should contain 'Mint exceeds max allowed per address'");
        }
    })

    it('should fail: try to mint more than max supply', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.PublicMint(2, {from: accounts[2], value: 20000000000000000});
            await eeInstance.PublicMint(2, {from: accounts[3], value: 20000000000000000});
            await eeInstance.PublicMint(2, {from: accounts[4], value: 20000000000000000});
            await eeInstance.PublicMint(2, {from: accounts[5], value: 20000000000000000});
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "You cannot exceed max supply", "The error message should contain 'You cannot exceed max supply'");
        }
    });

    it('Should succeed: get totalminted', async() =>{
        const eeInstance = await EternalEntities.deployed();
        let totalMintedAccount1 = await eeInstance.TotalMinted.call(accounts[1])
        expect(totalMintedAccount1).to.be.bignumber.equal(web3.utils.toBN('3'));
        let totalMintedAccount2 = await eeInstance.TotalMinted.call(accounts[2])
        expect(totalMintedAccount2).to.be.bignumber.equal(web3.utils.toBN('2'));
        let totalMintedAccount3 = await eeInstance.TotalMinted.call(accounts[3])
        expect(totalMintedAccount3).to.be.bignumber.equal(web3.utils.toBN('2'));
        let totalMintedAccount4 = await eeInstance.TotalMinted.call(accounts[4])
        expect(totalMintedAccount4).to.be.bignumber.equal(web3.utils.toBN('2'));
        let totalSupply = await eeInstance.totalSupply()
        expect(totalSupply).to.be.bignumber.equal(web3.utils.toBN('9'));
    });

    it('should fail: try to mint when all tokens have been minted', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.PublicMint(1, {from: accounts[5], value: 10000000000000000});
            await eeInstance.PublicMint(1, {from: accounts[6], value: 10000000000000000});
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "All tokens have been minted", "The error message should contain 'All tokens have been minted'");
        }
    });

    it('Should succeed: get totalminted2', async() =>{
        const eeInstance = await EternalEntities.deployed();
        let totalMintedAccount1 = await eeInstance.TotalMinted.call(accounts[1])
        expect(totalMintedAccount1).to.be.bignumber.equal(web3.utils.toBN('3'));
        let totalMintedAccount2 = await eeInstance.TotalMinted.call(accounts[2])
        expect(totalMintedAccount2).to.be.bignumber.equal(web3.utils.toBN('2'));
        let totalMintedAccount3 = await eeInstance.TotalMinted.call(accounts[3])
        expect(totalMintedAccount3).to.be.bignumber.equal(web3.utils.toBN('2'));
        let totalMintedAccount4 = await eeInstance.TotalMinted.call(accounts[4])
        expect(totalMintedAccount4).to.be.bignumber.equal(web3.utils.toBN('2'));
        let totalMintedAccount5 = await eeInstance.TotalMinted.call(accounts[5])
        expect(totalMintedAccount5).to.be.bignumber.equal(web3.utils.toBN('1'));
        let totalSupply = await eeInstance.totalSupply()
        expect(totalSupply).to.be.bignumber.equal(web3.utils.toBN('10'));
    });

    it('Should succeed: transfer eth as owner', async() =>{
        const eeInstance = await EternalEntities.deployed();
        
        initBalanceOfAccount0 = await web3.eth.getBalance(accounts[0]);
        initBalanceOfEeInstance = await web3.eth.getBalance(eeInstance.address);
        expect(initBalanceOfEeInstance).to.be.bignumber.equal(web3.utils.toBN('100000000000000000'));

        await eeInstance.TransferEth({from: accounts[0]});

        afterBalanceOfEeInstance = await web3.eth.getBalance(eeInstance.address);
        afterBalanceOfAccount0 = await web3.eth.getBalance(accounts[0]);
        expect(afterBalanceOfEeInstance).to.be.bignumber.equal(web3.utils.toBN('0'));
        expect(afterBalanceOfAccount0).to.be.bignumber.greaterThan(web3.utils.toBN(initBalanceOfAccount0));
    });
});

contract('ee presale tests', (accounts) =>{

    it('Should succeed: account not on whitelist', async() => {
        const eeInstance = await EternalEntities.deployed();
        let result = await eeInstance.IsOnWhitelist(accounts[1])
        expect(result).equal(false);
    });

    it('Should fail: try to mint when minting not active (not started)', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.PresaleMint(1, {from: accounts[1], value: 10000000000000000})
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Presale minting is not active", "The error message should contain 'Presale minting is not active'");
        }
    });

    it('should fail: try to mint with non whitelisted address', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.TogglePresaleStarted();
            await eeInstance.PresaleMint(1, {from: accounts[1], value: 10000000000000000})
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "You are not whitelisted!", "The error message should contain 'you are not whitelisted!'");
        }
    });

    it('should fail: try to mint more than allowed in single transaction', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            let preNrofwl = await eeInstance.NrOfAddressesInWhitelist.call()
            expect(preNrofwl).to.be.bignumber.equal(web3.utils.toBN('0'));
            await eeInstance.AddToWhitelist([accounts[1], accounts[2], accounts[3], accounts[4], accounts[5], accounts[6], accounts[7], accounts[8]])
            let postNrofwl = await eeInstance.NrOfAddressesInWhitelist.call()
            expect(postNrofwl).to.be.bignumber.equal(web3.utils.toBN('8'));
            await eeInstance.PresaleMint(3, {from: accounts[1], value: 20000000000000000})
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Cannot mint more than allowed", "The error message should contain 'Cannot mint more than allowed'");
        }
    });

    it('Should succeed: account on whitelist', async() => {
        const eeInstance = await EternalEntities.deployed();
        let result = await eeInstance.IsOnWhitelist(accounts[1])
        expect(result).equal(true);
    });

    it('should fail: try to mint with not enough eth send', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.PresaleMint(1, {from: accounts[1], value: 1000000000000000})
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Not enough eth send", "The error message should contain 'Not enough eth send'");
        }
    });

    it('Should fail: try to transfer eth when 0 available', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.TransferEth({from: accounts[0]})
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "No eth present", "The error message should contain 'No eth present'");
        }
    });

    it('Should succeed: Mint 1 nft', async() =>{
        const eeInstance = await EternalEntities.deployed();

        initBalanceOfAccount1 = await web3.eth.getBalance(accounts[1]);
        initBalanceOfEeInstances = await web3.eth.getBalance(eeInstance.address);
        expect(initBalanceOfEeInstances).to.be.bignumber.equal(web3.utils.toBN('0'));

        await eeInstance.PresaleMint(1, {from: accounts[1], value: 10000000000000000});
        
        afterBalanceOfAccount1 = await web3.eth.getBalance(accounts[1]);
        afterBalanceOfEeInstances = await web3.eth.getBalance(eeInstance.address);
        expect(afterBalanceOfAccount1).to.be.bignumber.lessThan(web3.utils.toBN(initBalanceOfAccount1).sub(web3.utils.toBN('10000000000000000')));
        expect(afterBalanceOfEeInstances).to.be.bignumber.equal(web3.utils.toBN('10000000000000000'));

        nftBalanceOfAccount1 = await eeInstance.balanceOf(accounts[1]);
        expect(nftBalanceOfAccount1).to.be.bignumber.equal(web3.utils.toBN('1'));
        ownerOfNft1 = await eeInstance.ownerOf(1);
        expect(ownerOfNft1).equal(accounts[1]);
        nftUri = await eeInstance.tokenURI(1);
        expect(nftUri).equal('https://test.com/api/1');
    });

    it('Should succeed: Mint 1 additional nft', async() =>{
        const eeInstance = await EternalEntities.deployed();

        initBalanceOfAccount1 = await web3.eth.getBalance(accounts[1]);
        initBalanceOfEeInstances = await web3.eth.getBalance(eeInstance.address);
        expect(initBalanceOfEeInstances).to.be.bignumber.equal(web3.utils.toBN('10000000000000000'));

        await eeInstance.PresaleMint(1, {from: accounts[1], value: 10000000000000000});
        
        afterBalanceOfAccount1 = await web3.eth.getBalance(accounts[1]);
        afterBalanceOfEeInstances = await web3.eth.getBalance(eeInstance.address);
        expect(afterBalanceOfAccount1).to.be.bignumber.lessThan(web3.utils.toBN(initBalanceOfAccount1).sub(web3.utils.toBN('10000000000000000')));
        expect(afterBalanceOfEeInstances).to.be.bignumber.equal(web3.utils.toBN(initBalanceOfEeInstances).add(web3.utils.toBN('10000000000000000')));

        nftBalanceOfAccount1 = await eeInstance.balanceOf(accounts[1]);
        expect(nftBalanceOfAccount1).to.be.bignumber.equal(web3.utils.toBN('2'));
        
        ownerOfNft1 = await eeInstance.ownerOf(1);
        expect(ownerOfNft1).equal(accounts[1]);
        nftUri = await eeInstance.tokenURI(1);
        expect(nftUri).equal('https://test.com/api/1');

        ownerOfNft2 = await eeInstance.ownerOf(2);
        expect(ownerOfNft2).equal(accounts[1]);
        nftUri2 = await eeInstance.tokenURI(2);
        expect(nftUri2).equal('https://test.com/api/2');
    });

    it('should fail: try to mint more than total allowed for single address', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.PresaleMint(1, {from: accounts[1], value: 10000000000000000});
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Mint exceeds max allowed per address", "The error message should contain 'Mint exceeds max allowed per address'");
        }
    })

    it('should fail: try to mint more than max supply', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.PresaleMint(2, {from: accounts[2], value: 20000000000000000});
            await eeInstance.PresaleMint(2, {from: accounts[3], value: 20000000000000000});
            await eeInstance.PresaleMint(2, {from: accounts[4], value: 20000000000000000});
            await eeInstance.PresaleMint(1, {from: accounts[5], value: 10000000000000000});
            await eeInstance.PresaleMint(2, {from: accounts[6], value: 20000000000000000});
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "You cannot exceed max supply", "The error message should contain 'You cannot exceed max supply'");
        }
    });

    it('should fail: try to mint when all tokens have been minted', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.PresaleMint(1, {from: accounts[7], value: 10000000000000000});
            await eeInstance.PresaleMint(1, {from: accounts[8], value: 10000000000000000});
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "All tokens have been minted", "The error message should contain 'All tokens have been minted'");
        }
    });

    it('Should succeed: remove account from whitelist', async() => {
        const eeInstance = await EternalEntities.deployed();
        await eeInstance.RemoveFromWhitelist([accounts[1]])
        let result = await eeInstance.IsOnWhitelist(accounts[1])
        expect(result).equal(false);
        let postNrofwl = await eeInstance.NrOfAddressesInWhitelist.call()
        expect(postNrofwl).to.be.bignumber.equal(web3.utils.toBN('7'));
    });

    it('Should succeed: transfer eth as owner', async() =>{
        const eeInstance = await EternalEntities.deployed();
        
        initBalanceOfAccount0 = await web3.eth.getBalance(accounts[0]);
        initBalanceOfEeInstance = await web3.eth.getBalance(eeInstance.address);
        expect(initBalanceOfEeInstance).to.be.bignumber.equal(web3.utils.toBN('100000000000000000'));

        await eeInstance.TransferEth({from: accounts[0]});

        afterBalanceOfEeInstance = await web3.eth.getBalance(eeInstance.address);
        afterBalanceOfAccount0 = await web3.eth.getBalance(accounts[0]);
        expect(afterBalanceOfEeInstance).to.be.bignumber.equal(web3.utils.toBN('0'));
        expect(afterBalanceOfAccount0).to.be.bignumber.greaterThan(web3.utils.toBN(initBalanceOfAccount0));
    });
});

contract('extra tests', (accounts) =>{
    it('should fail: try to reserve as non owner', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.Reserve(1, {from: accounts[1]});
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Ownable: caller is not the owner", "The error message should contain 'Ownable: caller is not the owner'");
        }
    });

    it('should fail: try to reserve more than allowed', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.Reserve(11);
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Cannot reserve more than allowed", "The error message should contain 'Cannot reserve more than allowed'");
        }
    });

    it('Should succeed: reserve as owner', async() =>{
        const eeInstance = await EternalEntities.deployed();
        
        let totalSupply = await eeInstance.totalSupply()
        expect(totalSupply).to.be.bignumber.equal(web3.utils.toBN('0'));

        await eeInstance.Reserve(10);

        totalSupply = await eeInstance.totalSupply()
        expect(totalSupply).to.be.bignumber.equal(web3.utils.toBN('10'));

        nftBalance = await eeInstance.balanceOf(accounts[0]);
        expect(nftBalance).to.be.bignumber.equal(web3.utils.toBN('10'));
    });

    it('Should fail: try to mint in public sale after all have been reserved', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.TogglePublicSaleStarted();
            await eeInstance.PublicMint(1, {from: accounts[1], value: 10000000000000000})
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "All tokens have been minte", "The error message should contain 'All tokens have been minte'");
        }
    });

    it('should fail: try to change price as non owner', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.setPrice(1, {from: accounts[1]});
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Ownable: caller is not the owner", "The error message should contain 'Ownable: caller is not the owner'");
        }
    });

    it('Should succeed: alter price', async()=>{
        const eeInstance = await EternalEntities.deployed();

        let priceBefore = await eeInstance.mintPrice.call();
        expect(priceBefore).to.be.bignumber.equal(web3.utils.toBN('10000000000000000'));
        
        await eeInstance.setPrice("200000000000000000");

        let priceAfter = await eeInstance.mintPrice.call();
        expect(priceAfter).to.be.bignumber.equal(web3.utils.toBN('200000000000000000'));
    });

    it('Should succeed: easter egg whitelist', async() =>{
        const eeInstance = await EternalEntities.deployed();
        
        let result = await eeInstance.IsOnWhitelist(accounts[1])
        expect(result).equal(false);

        await eeInstance.WhatDoesThisDoExactly({from: accounts[0]});
        await eeInstance.WhatDoesThisDoExactly({from: accounts[1]});
        await eeInstance.WhatDoesThisDoExactly({from: accounts[2]});
        await eeInstance.WhatDoesThisDoExactly({from: accounts[3]});
        await eeInstance.WhatDoesThisDoExactly({from: accounts[4]});
        await eeInstance.WhatDoesThisDoExactly({from: accounts[5]});
        await eeInstance.WhatDoesThisDoExactly({from: accounts[6]});
        await eeInstance.WhatDoesThisDoExactly({from: accounts[7]});
        await eeInstance.WhatDoesThisDoExactly({from: accounts[8]});

        let afterResult = await eeInstance.IsOnWhitelist(accounts[1])
        expect(afterResult).equal(true);
    });
    
    it('Should fail: easter egg already whitelisted', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.WhatDoesThisDoExactly({from: accounts[8]});
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "ah ah ah", "The error message should contain 'ah ah ah'");
        }
    });

    it('Should fail: easter egg whitelist after use', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.WhatDoesThisDoExactly({from: accounts[9]});
            await eeInstance.WhatDoesThisDoExactly({from: accounts[2]});
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Too late motherfucker!", "The error message should contain 'Too late motherfucker!'");
        }
    });
});

contract('free mint tests', (accounts) =>{
    it('should fail: try to mint with no free mints available', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.FreeMint()
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "No free mints available", "The error message should contain 'No free mints available'");
        }
    });

    it('Should succeed: free mint', async() => {
        const eeInstance = await EternalEntities.deployed();
        
        await eeInstance.UpdateFreeMintAvailable(2);
        await eeInstance.FreeMint()
        nftBalanceOfAccount0 = await eeInstance.balanceOf(accounts[0]);
        expect(nftBalanceOfAccount0).to.be.bignumber.equal(web3.utils.toBN('1'));
        ownerOfNft1 = await eeInstance.ownerOf(1);
        expect(ownerOfNft1).equal(accounts[0]);

        let totalMintedAccount0 = await eeInstance.TotalMinted.call(accounts[0])
        expect(totalMintedAccount0).to.be.bignumber.equal(web3.utils.toBN('0'));

        let totalSupply = await eeInstance.totalSupply()
        expect(totalSupply).to.be.bignumber.equal(web3.utils.toBN('1'));
    });

    it('Should fail: try to mint more than allowed per account', async()=>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.FreeMint()
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "Mint exceeds max of 1 allowed per address", "The error message should contain 'Mint exceeds max of 1 allowed per address'");
        }
    });

    it('should fail: try to mint after with no free mints available', async() =>{
        const eeInstance = await EternalEntities.deployed();
        try{
            await eeInstance.FreeMint({from: accounts[2]})

            let totalMintedAccount2 = await eeInstance.TotalMinted.call(accounts[2])
            expect(totalMintedAccount2).to.be.bignumber.equal(web3.utils.toBN('0'));
            let totalSupply = await eeInstance.totalSupply()
            expect(totalSupply).to.be.bignumber.equal(web3.utils.toBN('2'));
            
            await eeInstance.FreeMint()
            assert.fail("The transaction should have thrown an error");
        }
        catch(err){
            assert.include(err.message, "No free mints available", "The error message should contain 'No free mints available'");
        }
    });
});