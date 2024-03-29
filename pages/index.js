import { ethers, Signer } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftAddress, nftMarketAddress } from "../config";

import NFT from "../abi/NFT.json";
import Market from "../abi/NFTMarket.json";
const projectId = "9a90b1de94af4668ab0a611d914dcd32";
export default function Home() {
	const [nfts, setNft] = useState([]);
	const [loadingState, setLoading] = useState("not-loaded");

	useEffect(() => {
		loadNfts();
	}, []);

	async function loadNfts() {
		const provider = new ethers.providers.JsonRpcProvider(
			`https://polygon-mumbai.infura.io/v3/${projectId}`
		);
		const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
		const marketContract = new ethers.Contract(
			nftMarketAddress,
			Market.abi,
			provider
		);

		const data = await marketContract.fetchMarketitems();

		const items = await Promise.all(
			data.map(async (i) => {
				const tokenUri = await tokenContract.tokenURI(i.tokenId);
				const meta = await axios.get(tokenUri);
				let price = ethers.utils.formatUnits(i.price.toString(), "ether");
				let item = {
					price,
					tokenId: i.tokenId.toNumber(),
					seller: i.seller,
					owner: i.owner,
					image: meta.data.image,
					name: meta.data.name,
					description: meta.data.description,
				};
				return item;
			})
		);
		setNft(items);
		setLoading("loaded");
	}

	async function buyNft(nft) {
		const web3Modal = new Web3Modal();
		const connection = await web3Modal.connect();
		const provider = new ethers.providers.Web3Provider(connection);

		const signer = provider.getSigner();
		const contract = await new ethers.Contract(
			nftMarketAddress,
			Market.abi,
			signer
		);

		const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
		const transaction = await contract.createMarketSale(nftAddress, nft.tokenId, {
			value: price,
		});
		await transaction.wait();
		loadNfts();
	}
	if (loadingState === "loaded" && !nfts.length)
		return <h1 className="px-20 py-10 text-3xl">No items in the market Place</h1>;
	return (
		<div className="flex justify-center">
			<div className="px-4" style={{ maxWidth: "1600px" }}>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 ">
					{nfts.map((nft, i) => (
						<div key={i} className="border shadow rounded-xl overflow-hidden ">
							<img src={nft?.image} />
							<div className="p-4 bg-slate-100">
								<p style={{ height: "64px" }} className="text-2xl font-semibold">
									{nft?.name}
								</p>
								<div style={{ height: "70px", overflow: "hidden" }}>
									<p className="text-gray-400">{nft?.description}</p>
								</div>
							</div>
							<div className="p-4 bg-black">
								<p className="text-2xl mb-4 font-bold text-white">{nft?.price} Matic</p>
								<button
									className="w-full bg-sky-500/50 text-white font-bold py-2 px-12 rounded"
									onClick={() => buyNft(nft)}
								>
									Buy
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
