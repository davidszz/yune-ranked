import { Assets } from './Constants';
import { UserRank } from './UserRank';

export const Ranks = [
	{
		id: UserRank.Unranked,
		name: 'unranked',
		mmr: 0,
		maxPdl: 0,
		assets: {
			badge: Assets.images('ranks/badges/unranked.png'),
			regalia: Assets.images('ranks/regalias/unranked.png'),
		},
	},
	{
		id: UserRank.Iron1,
		name: 'iron',
		division: 1,
		mmr: 200,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/iron.png'),
			regalia: Assets.images('ranks/regalias/iron.png'),
		},
	},
	{
		id: UserRank.Iron2,
		name: 'iron',
		division: 2,
		mmr: 300,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/iron.png'),
			regalia: Assets.images('ranks/regalias/iron.png'),
		},
	},
	{
		id: UserRank.Iron3,
		name: 'iron',
		division: 3,
		mmr: 400,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/iron.png'),
			regalia: Assets.images('ranks/regalias/iron.png'),
		},
	},
	{
		id: UserRank.Bronze1,
		name: 'bronze',
		division: 1,
		mmr: 500,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/bronze.png'),
			regalia: Assets.images('ranks/regalias/bronze.png'),
		},
	},
	{
		id: UserRank.Bronze2,
		name: 'bronze',
		division: 2,
		mmr: 600,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/bronze.png'),
			regalia: Assets.images('ranks/regalias/bronze.png'),
		},
	},
	{
		id: UserRank.Bronze3,
		name: 'bronze',
		division: 3,
		mmr: 700,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/bronze.png'),
			regalia: Assets.images('ranks/regalias/bronze.png'),
		},
	},
	{
		id: UserRank.Silver1,
		name: 'silver',
		division: 1,
		mmr: 800,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/silver.png'),
			regalia: Assets.images('ranks/regalias/silver.png'),
		},
	},
	{
		id: UserRank.Silver2,
		name: 'silver',
		division: 2,
		mmr: 900,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/silver.png'),
			regalia: Assets.images('ranks/regalias/silver.png'),
		},
	},
	{
		id: UserRank.Silver3,
		name: 'silver',
		division: 3,
		mmr: 1000,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/silver.png'),
			regalia: Assets.images('ranks/regalias/silver.png'),
		},
	},
	{
		id: UserRank.Gold1,
		name: 'gold',
		division: 1,
		mmr: 1100,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/gold.png'),
			regalia: Assets.images('ranks/regalias/gold.png'),
		},
	},
	{
		id: UserRank.Gold2,
		name: 'gold',
		division: 2,
		mmr: 1200,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/gold.png'),
			regalia: Assets.images('ranks/regalias/gold.png'),
		},
	},
	{
		id: UserRank.Gold3,
		name: 'gold',
		division: 3,
		mmr: 1300,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/gold.png'),
			regalia: Assets.images('ranks/regalias/gold.png'),
		},
	},
	{
		id: UserRank.Platinum1,
		name: 'platinum',
		division: 1,
		mmr: 1400,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/platinum.png'),
			regalia: Assets.images('ranks/regalias/platinum.png'),
		},
	},
	{
		id: UserRank.Platinum2,
		name: 'platinum',
		division: 2,
		mmr: 1500,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/platinum.png'),
			regalia: Assets.images('ranks/regalias/platinum.png'),
		},
	},
	{
		id: UserRank.Platinum3,
		name: 'platinum',
		division: 3,
		mmr: 1600,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/platinum.png'),
			regalia: Assets.images('ranks/regalias/platinum.png'),
		},
	},
	{
		id: UserRank.Diamond1,
		name: 'diamond',
		division: 1,
		mmr: 1700,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/diamond.png'),
			regalia: Assets.images('ranks/regalias/diamond.png'),
		},
	},
	{
		id: UserRank.Diamond2,
		name: 'diamond',
		division: 2,
		mmr: 1800,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/diamond.png'),
			regalia: Assets.images('ranks/regalias/diamond.png'),
		},
	},
	{
		id: UserRank.Diamond3,
		name: 'diamond',
		division: 3,
		mmr: 1900,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/diamond.png'),
			regalia: Assets.images('ranks/regalias/diamond.png'),
		},
	},
	{
		id: UserRank.Master1,
		name: 'master',
		division: 1,
		mmr: 2000,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/master.png'),
			regalia: Assets.images('ranks/regalias/master.png'),
		},
	},
	{
		id: UserRank.Master2,
		name: 'master',
		division: 2,
		mmr: 2100,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/master.png'),
			regalia: Assets.images('ranks/regalias/master.png'),
		},
	},
	{
		id: UserRank.Master3,
		name: 'master',
		division: 3,
		mmr: 2200,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/master.png'),
			regalia: Assets.images('ranks/regalias/master.png'),
		},
	},
	{
		id: UserRank.GrandMaster,
		name: 'grand_master',
		mmr: 2300,
		maxPdl: 400,
		assets: {
			badge: Assets.images('ranks/badges/grand_master.png'),
			regalia: Assets.images('ranks/regalias/grand_master.png'),
		},
	},
	{
		id: UserRank.Challenger,
		name: 'challenger',
		mmr: 2800,
		maxPdl: 3000,
		assets: {
			badge: Assets.images('ranks/badges/challenger.png'),
			regalia: Assets.images('ranks/regalias/challenger.png'),
		},
	},
];
