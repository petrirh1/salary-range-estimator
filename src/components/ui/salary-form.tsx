import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import deepEqual from 'deep-equal';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2Icon, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import type { FormValidValuesResponse, SalaryRangeRequest } from '@/types';
import { toast } from 'sonner';
import { Combobox } from './combobox';

export const API_BASE = import.meta.env.VITE_API_PROXY || '/api';

export const formSchema = z.object({
	jobTitle: z.string().min(1),
	experience: z
		.number({
			error: (iss) => (iss.input === undefined ? '' : ''),
		})
		.min(0, { message: 'Kokemus ei voi olla alle 0 vuotta' })
		.max(60, { message: 'Kokemus ei voi olla yli 60 vuotta' }),
	education: z.string().optional(),
	industry: z.string().min(1),
	location: z.string().optional(),
	technologies: z.array(z.string()).min(1),
	currentSalary: z
		.number()
		.min(0, { message: 'Nykyinen palkka ei voi olla negatiivinen' })
		.max(16_000, { message: 'Palkan enimmäismäärä on 16 000 euroa kuukaudessa' })
		.optional(),
});

const defaultValues = {
	jobTitle: '',
	experience: undefined,
	education: undefined,
	industry: '',
	location: undefined,
	technologies: [],
	currentSalary: undefined,
};

interface SalaryFormProps {
	submit: (body: SalaryRangeRequest) => void;
	error: Error | null;
	loading: boolean;
}

export type SalaryFormValues = z.infer<typeof formSchema>;

function SalaryForm({ submit, loading, error }: SalaryFormProps) {
	const [lastSubmittedValues, setLastSubmittedValues] = useState<SalaryRangeRequest | null>(null);

	const {
		data: values,
		error: valuesError,
		loading: valuesLoading,
	} = useFetch<FormValidValuesResponse>(`${API_BASE}/form-allowed-values`);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	useEffect(() => {
		if (valuesError) {
			toast.error('Lomakkeen lataaminen epäonnistui.', {
				duration: 8_0000,
				action: (
					<Button
						style={{ transition: 'background-color 0.2s ease, color 0.2s ease' }}
						className='hover:bg-red-100 hover:text-[red-400]'
						size='sm'
						variant='ghost'
						onClick={() => window.location.reload()}>
						<RefreshCw />
						Päivitä sivu
					</Button>
				),
			});
		}
	}, [valuesError]);

	const toastId = useRef<string | number | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (valuesLoading) {
			timeoutRef.current = setTimeout(() => {
				toastId.current = toast.info('Lomakkeen latauksessa kestää normaalia pidempään.', {
					duration: Infinity,
				});
			}, 8_000);
		} else {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}

			if (toastId.current) {
				toast.dismiss(toastId.current);
				toastId.current = null;
			}
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			if (toastId.current) {
				toast.dismiss(toastId.current);
			}
		};
	}, [valuesLoading]);

	function onSubmit(values: z.infer<typeof formSchema>) {
		if (!error && deepEqual(values, lastSubmittedValues)) {
			toast.info('Ei muutoksia. Tulokset ovat ajan tasalla.');
			return;
		}

		submit(values);
		setLastSubmittedValues(values);
	}

	const renderLoadingState = () => {
		if (loading || valuesLoading) {
			return (
				<span className='inline-flex items-center gap-2'>
					<Loader2Icon className='animate-spin' />
					{loading ? 'Lasketaan markkina-arvoasi...' : 'Ladataan lomaketta...'}
				</span>
			);
		}

		return 'Laske markkina-arvoni';
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-8 mx-auto py-8 border px-8 mt-4 rounded-lg bg-neutral-50'>
				{/* Job Title */}
				<Combobox
					form={form}
					loading={loading}
					valuesLoading={valuesLoading}
					values={values?.jobTitles}
					fieldName='jobTitle'
					label={'Työnimike'}
					defaultLabel={'Valitse työnimike'}
					placeholder={'Hae työnimikettä'}
					noResultsText={'Työnimikettä ei löytynyt'}
				/>

				<div className='flex gap-4'>
					{/* Experience */}
					<div className='flex-shrink basis-1/2 min-w-0'>
						<FormField
							disabled={loading || valuesLoading}
							control={form.control}
							name='experience'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Työkokemus (vuosina)</FormLabel>
									<FormControl>
										<Input
											type='number'
											step={0.1}
											{...field}
											value={field.value !== undefined ? String(field.value) : ''}
											onChange={(e) => {
												const val = e.target.value;
												field.onChange(val === '' ? undefined : Number(val));
											}}
										/>
									</FormControl>
									<FormMessage className='text-xs' />
								</FormItem>
							)}
						/>
					</div>

					{/* Education */}
					<div className='flex-grow flex-shrink basis-1/2 min-w-0'>
						<Combobox
							form={form}
							loading={loading}
							valuesLoading={valuesLoading}
							values={values?.educations}
							fieldName='education'
							label={'Koulutustaso (valinnainen)'}
							defaultLabel={'Valitse koulutustaso'}
							placeholder={'Hae koulutustasoa'}
							noResultsText={'Koulutustasoa ei löytynyt'}
						/>
					</div>
				</div>

				<div className='flex gap-4'>
					{/* Industry */}
					<div className='flex-shrink basis-1/2 min-w-0 mt-auto'>
						<Combobox
							form={form}
							loading={loading}
							valuesLoading={valuesLoading}
							values={values?.industries}
							fieldName='industry'
							label={'Toimiala'}
							defaultLabel={'Valitse toimiala'}
							placeholder={'Hae toimialaa'}
							noResultsText={'Toimialaa ei löytynyt'}
						/>
					</div>

					{/* Location */}
					<div className='flex-grow flex-shrink basis-1/2 min-w-0'>
						<Combobox
							form={form}
							loading={loading}
							valuesLoading={valuesLoading}
							values={values?.locations}
							fieldName='location'
							label={'Sijainti (valinnainen)'}
							defaultLabel={'Valitse sijainti'}
							placeholder={'Hae sijaintia'}
							noResultsText={'Sijaintia ei löytynyt'}
						/>
					</div>
				</div>

				{/* Technologies */}
				<div className='flex-grow flex-shrink basis-1/2 min-w-0'>
					<Combobox
						form={form}
						multiple
						loading={loading}
						valuesLoading={valuesLoading}
						values={values?.technologies}
						fieldName='technologies'
						label={'Teknologiat'}
						defaultLabel={'Valitse teknologiat'}
						placeholder={'Hae teknologiaa'}
						noResultsText={'Teknologiaa ei löytynyt'}
					/>
				</div>

				{/* Salary */}
				<FormField
					disabled={loading || valuesLoading}
					control={form.control}
					name='currentSalary'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nykyinen bruttopalkka €/kk (valinnainen)</FormLabel>
							<FormControl>
								<Input
									type='number'
									{...field}
									value={field.value !== undefined ? String(field.value) : ''}
									onChange={(e) => {
										const val = e.target.value;
										field.onChange(val === '' ? undefined : Number(val));
									}}
								/>
							</FormControl>
							<FormMessage className='text-xs' />
						</FormItem>
					)}
				/>

				{/* Submit */}
				<Button className='w-full' size={'lg'} type='submit' disabled={loading || valuesLoading}>
					{renderLoadingState()}
				</Button>
			</form>
		</Form>
	);
}

export { SalaryForm };
