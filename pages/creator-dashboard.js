import { ethers, Signer } from "ethers"
import { useEffect, useState } from "react"
import axios from "axios"
import Web3Modal from "web3modal"

import {
  nftAddress,
  nftMarketAddress
} from '../config'

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json"


export default function CreatorsDashboard(){
    const [nfts, setNft] = useState([]) 
    const [sold, setSold] =  useState([])
    const [loadingState, setLoading] = useState('not-loaded') 
  
    useEffect(()=> {
      loadNfts()
    },[])

    async function loadNfts(){
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const tokenContract = new ethers.Contract(nftAddress, NFT.abi, signer);
        const marketContract = new ethers.Contract(nftMarketAddress, Market.abi, signer);

        const data = await marketContract.fetchItemsCreated()

        const items = await Promise.all(data.map(async i =>{
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
              price,
              tokenId: i.tokenId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              image: meta.data.image,
              name: meta.data.name,
              description: meta.data.description,
              sold:i.sold
            }
            return item
          }))

          const soldItems = items.filter(i => i.sold)
          setSold(soldItems);
          setNft(items)
          console.log('sold:',items)
          setLoading('loaded')




    }
    return(
        <div>
        <div className="p-4" >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 ">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden ">
                  <img src={nft?.image} className="rounnded" style={{width:'100%'}}/>
                  <div className="p-4 bg-slate-100">
                    <p style={{height:'64px'}} className="text-2xl font-semibold">{nft?.name}</p>
                  </div>
                  <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">Price - {nft?.price} ETH</p>
               
                  </div>
  
                </div>
              ))
            }
          </div>
  
        </div>
        <div className="px-4" >
            {
                Boolean(sold.length) && (
                    <div>
                        <h2 className="text-2xl text-white py-2">Items Sold</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 ">
                            {
                            sold.map((nft, i) => (
                                <div key={i} className="border shadow rounded-xl overflow-hidden ">
                                <img src={nft?.image} className="rounded"/>
                                <div className="p-4 bg-slate-100">
                                    <p style={{height:'64px'}} className="text-2xl font-semibold">{nft?.name}</p>
                                </div>
                                <div className="p-4 bg-black">
                                <p className="text-2xl mb-4 font-bold text-white">Price - {nft?.price} ETH</p>
                            
                                </div>
                
                                </div>
                            ))
                            }
                        </div>
                    </div>

                )
            }
          
  
        </div>

  
      </div>
    )
}