import { ChartColumn } from 'lucide-react';
import { Button } from './ui/button';
import Markdown from 'react-markdown';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
import type { SalaryRangeResponse } from '@/types';

interface SalaryRangeSectionProps {
	data: SalaryRangeResponse | null;
	loading: boolean;
}

function SalaryRangeSection({ data, loading }: SalaryRangeSectionProps) {
	if (!data || loading) return null;

	const { salaryRange, salaryAnalysis } = data;

	return (
		<section aria-live='polite' aria-atomic='true' className='flex flex-col mt-6 mb-12'>
			<div className='flex items-center'>
				<h2 className='text-xl mr-auto'>Arvioitu palkkahaarukka €/kk</h2>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant='secondary' size='sm'>
							Tarkempi analyysi
							<ChartColumn />
						</Button>
					</DialogTrigger>
					<DialogContent className='sm:max-w-[625px]'>
						<DialogHeader>
							<DialogTitle className='text-2xl mr-6 sm:text-3xl text-left'>
								Palkkahaarukka-analyysi
							</DialogTitle>
							<DialogDescription className='text-left'>
								Arvio perustuu syöttämiisi tietoihin sekä Suomen nykyiseen työmarkkinatilanteeseen.
							</DialogDescription>
						</DialogHeader>
						<div className='grid gap-6 max-h-[50vh] pr-4 overflow-scroll'>
							<Markdown>{salaryAnalysis}</Markdown>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant='outline'>Sulje</Button>
							</DialogClose>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
			<h3 className='text-4xl font-bold pt-2 pb-3'>{salaryRange}</h3>
			<p className='text-sm opacity-75'>
				Arvio perustuu syöttämiisi tietoihin sekä Suomen nykyiseen työmarkkinatilanteeseen.
			</p>
		</section>
	);
}

export { SalaryRangeSection };
