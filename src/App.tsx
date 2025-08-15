import { SalaryForm } from './components/ui/salary-form';
import { SalaryRangeSection } from './components/ui/salary-range-section';
import { Header } from './components/ui/header';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { Footer } from './components/ui/footer';
import { useFetch } from './hooks/useFetch';
import type { SalaryRangeRequest, SalaryRangeResponse } from './types';

function App() {
	const { data, loading, error, refetch } = useFetch<SalaryRangeResponse>(null, { skip: true });

	useEffect(() => {
		if (error) {
			toast.error('Lomakkeen lähetys epäonnistui. Yritäthän uudelleen hetken kuluttua.');
		}
	}, [error]);

	const submit = (body: SalaryRangeRequest) => {
		refetch('/api/salary', {
			method: 'POST',
			body,
			headers: { 'Content-Type': 'application/json' },
		});
	};

	return (
		<div className='flex flex-col min-h-screen'>
			<main className='max-w-xl w-full mx-auto px-4 mt-8 mb-auto'>
				<Header />
				<SalaryForm submit={submit} loading={loading} error={error} />
				<SalaryRangeSection data={data} loading={loading} />
			</main>
			<Toaster position='top-center' richColors />
			<Footer />
		</div>
	);
}

export default App;
