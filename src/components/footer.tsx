function Footer() {
	return (
		<footer className='border-t mt-12 w-full '>
			<div className='max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center py-8 gap-2 text-sm text-muted-foreground px-6'>
				<div className='text-center md:text-left text-xs'>
					<p className='font-medium'>© {new Date().getFullYear()} Palkkahaarukka</p>
				</div>
				<div className='text-xs text-muted-foreground text-center md:text-right max-w-full md:max-w-md'>
					Palkka-arviot perustuvat antamiisi tietoihin ja Suomen nykyiseen työmarkkinatilanteeseen.
					Vain ohjeelliseen käyttöön.
				</div>
			</div>
		</footer>
	);
}

export { Footer };
