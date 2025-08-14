import { PalkkahaarukkaIcon } from './ui/icons/palkkahaarukka';

function Header() {
	return (
		<header className='flex items-center'>
			<PalkkahaarukkaIcon />
			<div className='ml-3 flex flex-col'>
				<h1 className='scroll-m-20 text-center text-3xl font-bold tracking-tight text-balance text-left'>
					Palkkahaarukka
				</h1>
				<p className='text-sm opacity-75'>Selvitä helposti oma palkkatasosi markkinoilla.</p>
			</div>
		</header>
	);
}

export { Header };
