import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { cn, deepEqual } from '@/lib/utils';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown, Loader2Icon, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { useMediaQuery } from '@react-hook/media-query';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './command';
import { useEffect, useState } from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from './drawer';
import { DialogDescription, DialogTitle } from './dialog';
import { useFetch } from '@/hooks/useFetch';
import type { FormValidValuesResponse, SalaryRangeRequest } from '@/types';
import { toast } from 'sonner';

const formSchema = z.object({
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
	industry: '',
	location: '',
	technologies: [],
	currentSalary: undefined,
};

interface SalaryFormProps {
	submit: (body: SalaryRangeRequest) => void;
	error: Error | null;
	loading: boolean;
}

function SalaryForm({ submit, loading, error }: SalaryFormProps) {
	const [openJobTitle, setOpenJobTitle] = useState(false);
	const [openEducation, setOpenEducation] = useState(false);
	const [openIndustry, setOpenIndustry] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openTechnologies, setOpenTechnologies] = useState(false);
	const [lastSubmittedValues, setLastSubmittedValues] = useState<SalaryRangeRequest | null>(null);
	const isDesktop = useMediaQuery('(min-width: 768px)');

	const {
		data: values,
		error: valuesError,
		loading: valuesLoading,
	} = useFetch<FormValidValuesResponse>('/api/form-allowed-values');

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

	function onSubmit(values: z.infer<typeof formSchema>) {
		if (!error && deepEqual(values, lastSubmittedValues)) {
			toast.info('Ei muutoksia. Tulokset ovat ajan tasalla.');
			return;
		}

		submit(values);
		setLastSubmittedValues(values);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-8 mx-auto py-8 border px-8 mt-4 rounded-lg bg-neutral-50'>
				{/* Job Title */}
				{isDesktop && (
					<FormField
						control={form.control}
						name='jobTitle'
						render={({ field }) => (
							<FormItem className='flex flex-col'>
								<FormLabel>Työnimike</FormLabel>
								<Popover open={openJobTitle} onOpenChange={setOpenJobTitle}>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												disabled={loading || valuesLoading}
												variant='outline'
												role='combobox'
												className={cn(
													'w-full items-center justify-between bg-white',
													!field.value && 'text-muted-foreground'
												)}>
												<span className='truncate flex-1 min-w-0 text-left'>
													{field.value
														? values?.jobTitles.find((jobTitle) => jobTitle === field.value)
														: 'Valitse työnimike'}
												</span>
												<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent align={'start'} className='p-0'>
										<Command className='max-h-[300px]'>
											<CommandInput placeholder='Hae työnimikettä' />
											<CommandList>
												<CommandEmpty>Työnimikettä ei löytynyt</CommandEmpty>
												<CommandGroup>
													{values?.jobTitles?.map((jobTitle) => (
														<CommandItem
															value={jobTitle}
															key={jobTitle}
															onSelect={() => {
																form.setValue('jobTitle', jobTitle, { shouldValidate: true });
																setOpenJobTitle(false);
															}}>
															<Check
																className={cn(
																	'mr-2 h-4 w-4',
																	jobTitle === field.value ? 'opacity-100' : 'opacity-0'
																)}
															/>
															{jobTitle}
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</FormItem>
						)}
					/>
				)}
				{!isDesktop && (
					<FormField
						control={form.control}
						name='jobTitle'
						render={({ field }) => (
							<FormItem className='flex flex-col'>
								<FormLabel>Työnimike</FormLabel>
								<Drawer open={openJobTitle} onOpenChange={setOpenJobTitle}>
									<DrawerTrigger asChild>
										<FormControl>
											<Button
												disabled={loading || valuesLoading}
												variant='outline'
												role='combobox'
												className={cn(
													'w-full items-center justify-between bg-white',
													!field.value && 'text-muted-foreground'
												)}>
												<span className='truncate flex-1 min-w-0 text-left'>
													{field.value
														? values?.jobTitles.find((jobTitle) => jobTitle === field.value)
														: 'Valitse työnimike'}
												</span>
												<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
											</Button>
										</FormControl>
									</DrawerTrigger>
									<DrawerContent className='p-0 bg-white'>
										<DialogTitle className='px-4 pt-4 text-lg font-semibold'>Työnimike</DialogTitle>
										<DialogDescription className='px-4 pb-4 text-sm text-muted-foreground'>
											Valitse työnimike
										</DialogDescription>
										<div className='px-4 py-0'>
											<Command className='max-h-[60vh]'>
												<CommandInput placeholder='Hae työnimikettä' className='text-base' />
												<CommandList>
													<CommandEmpty>Työnimikettä ei löytynyt</CommandEmpty>
													<CommandGroup>
														{values?.jobTitles?.map((jobTitle) => (
															<CommandItem
																value={jobTitle}
																key={jobTitle}
																onSelect={() => {
																	form.setValue('jobTitle', jobTitle);
																	setOpenJobTitle(false);
																}}>
																<Check
																	className={cn(
																		'mr-2 h-4 w-4',
																		jobTitle === field.value ? 'opacity-100' : 'opacity-0'
																	)}
																/>
																{jobTitle}
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</div>
									</DrawerContent>
								</Drawer>
							</FormItem>
						)}
					/>
				)}

				<div className='flex gap-4'>
					{/* Experience */}
					<div className='flex-shrink basis-1/2 min-w-0'>
						<FormField
							disabled={loading}
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
						{isDesktop && (
							<FormField
								control={form.control}
								name='education'
								render={({ field }) => (
									<FormItem className='flex flex-col'>
										<FormLabel>Koulutustaso (valinnainen)</FormLabel>
										<Popover open={openEducation} onOpenChange={setOpenEducation}>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														disabled={loading || valuesLoading}
														variant='outline'
														role='combobox'
														className={cn(
															'w-full items-center justify-between bg-white',
															!field.value && 'text-muted-foreground'
														)}>
														<span className='truncate flex-1 min-w-0 text-left'>
															{field.value
																? values?.educations.find((education) => education === field.value)
																: 'Valitse koulutustaso'}
														</span>
														<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent align={'start'} className='p-0'>
												<Command className='max-h-[300px]'>
													<CommandInput placeholder='Hae koulutustasoa' />
													<CommandList>
														<CommandEmpty>Koulutustasoa ei löytynyt</CommandEmpty>
														<CommandGroup>
															{values?.educations?.map((education) => (
																<CommandItem
																	value={education}
																	key={education}
																	onSelect={() => {
																		const currentValue = form.getValues('education');
																		form.setValue(
																			'education',
																			currentValue === education ? undefined : education
																		);
																		setOpenEducation(false);
																	}}>
																	<Check
																		className={cn(
																			'mr-2 h-4 w-4',
																			education === field.value ? 'opacity-100' : 'opacity-0'
																		)}
																	/>
																	{education}
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									</FormItem>
								)}
							/>
						)}
						{!isDesktop && (
							<FormField
								control={form.control}
								name='education'
								render={({ field }) => (
									<FormItem className='flex flex-col'>
										<FormLabel>Koulutustaso (valinnainen)</FormLabel>
										<Drawer open={openEducation} onOpenChange={setOpenEducation}>
											<DrawerTrigger asChild>
												<FormControl>
													<Button
														disabled={loading || valuesLoading}
														variant='outline'
														role='combobox'
														className={cn(
															'w-full items-center justify-between bg-white',
															!field.value && 'text-muted-foreground'
														)}>
														<span className='truncate flex-1 min-w-0 text-left'>
															{field.value
																? values?.educations.find((education) => education === field.value)
																: 'Valitse koulutustaso'}
														</span>
														<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
													</Button>
												</FormControl>
											</DrawerTrigger>
											<DrawerContent className='p-0 bg-white'>
												<DialogTitle className='px-4 pt-4 text-lg font-semibold'>
													Koulutustaso (valinnainen)
												</DialogTitle>
												<DialogDescription className='px-4 pb-4 text-sm text-muted-foreground'>
													Valitse koulutustaso
												</DialogDescription>
												<div className='px-4 py-0'>
													<Command className='max-h-[60vh]'>
														<CommandInput placeholder='Hae koulutustasoa' className='text-base' />
														<CommandList>
															<CommandEmpty>Koulutustasoa ei löytynyt</CommandEmpty>
															<CommandGroup>
																{values?.educations.map((education) => (
																	<CommandItem
																		value={education}
																		key={education}
																		onSelect={() => {
																			const currentValue = form.getValues('education');
																			form.setValue(
																				'education',
																				currentValue === education ? undefined : education
																			);
																			setOpenEducation(false);
																		}}>
																		<Check
																			className={cn(
																				'mr-2 h-4 w-4',
																				education === field.value ? 'opacity-100' : 'opacity-0'
																			)}
																		/>
																		{education}
																	</CommandItem>
																))}
															</CommandGroup>
														</CommandList>
													</Command>
												</div>
											</DrawerContent>
										</Drawer>
									</FormItem>
								)}
							/>
						)}
					</div>
				</div>

				{/* Industry */}
				<div className='flex gap-4 '>
					<div className='flex-shrink basis-1/2 min-w-0'>
						{isDesktop && (
							<FormField
								control={form.control}
								name='industry'
								render={({ field }) => (
									<FormItem className='flex flex-col'>
										<FormLabel>Toimiala</FormLabel>
										<Popover open={openIndustry} onOpenChange={setOpenIndustry}>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														disabled={loading || valuesLoading}
														variant='outline'
														role='combobox'
														className={cn(
															'w-full items-center justify-between bg-white',
															!field.value && 'text-muted-foreground'
														)}>
														<span className='truncate flex-1 min-w-0 text-left'>
															{field.value
																? values?.industries.find((industry) => industry === field.value)
																: 'Valitse toimiala'}
														</span>
														<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent align={'start'} className='p-0'>
												<Command className='max-h-[300px]'>
													<CommandInput placeholder='Hae toimialaa' />
													<CommandList>
														<CommandEmpty>Toimialaa ei löytynyt</CommandEmpty>
														<CommandGroup>
															{values?.industries?.map((industry) => (
																<CommandItem
																	value={industry}
																	key={industry}
																	onSelect={() => {
																		form.setValue('industry', industry, { shouldValidate: true });
																		setOpenIndustry(false);
																	}}>
																	<Check
																		className={cn(
																			'mr-2 h-4 w-4',
																			industry === field.value ? 'opacity-100' : 'opacity-0'
																		)}
																	/>
																	{industry}
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									</FormItem>
								)}
							/>
						)}
						{!isDesktop && (
							<FormField
								control={form.control}
								name='industry'
								render={({ field }) => (
									<FormItem className='flex flex-col'>
										<FormLabel>Toimiala</FormLabel>
										<Drawer open={openIndustry} onOpenChange={setOpenIndustry}>
											<DrawerTrigger asChild>
												<FormControl>
													<Button
														disabled={loading || valuesLoading}
														variant='outline'
														role='combobox'
														className={cn(
															'w-full items-center justify-between bg-white',
															!field.value && 'text-muted-foreground'
														)}>
														<span className='truncate flex-1 min-w-0 text-left'>
															{field.value
																? values?.industries.find((industry) => industry === field.value)
																: 'Valitse toimiala'}
														</span>
														<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
													</Button>
												</FormControl>
											</DrawerTrigger>
											<DrawerContent className='p-0 bg-white'>
												<DialogTitle className='px-4 pt-4 text-lg font-semibold'>
													Toimiala
												</DialogTitle>
												<DialogDescription className='px-4 pb-4 text-sm text-muted-foreground'>
													Valitse toimiala
												</DialogDescription>
												<div className='px-4 py-0'>
													<Command className='max-h-[60vh]'>
														<CommandInput placeholder='Hae toimialaa' className='text-base' />
														<CommandList>
															<CommandEmpty>Toimialaa ei löytynyt</CommandEmpty>
															<CommandGroup>
																{values?.industries?.map((industry) => (
																	<CommandItem
																		value={industry}
																		key={industry}
																		onSelect={() => {
																			form.setValue('industry', industry, { shouldValidate: true });
																			setOpenIndustry(false);
																		}}>
																		<Check
																			className={cn(
																				'mr-2 h-4 w-4',
																				industry === field.value ? 'opacity-100' : 'opacity-0'
																			)}
																		/>
																		{industry}
																	</CommandItem>
																))}
															</CommandGroup>
														</CommandList>
													</Command>
												</div>
											</DrawerContent>
										</Drawer>
									</FormItem>
								)}
							/>
						)}
					</div>

					{/* Location */}
					<div className='flex-grow flex-shrink basis-1/2 min-w-0'>
						{isDesktop && (
							<FormField
								control={form.control}
								name='location'
								render={({ field }) => (
									<FormItem className='flex flex-col'>
										<FormLabel>Sijainti (valinnainen)</FormLabel>
										<Popover open={openLocation} onOpenChange={setOpenLocation}>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														disabled={loading || valuesLoading}
														variant='outline'
														role='combobox'
														className={cn(
															'w-full items-center justify-between bg-white',
															!field.value && 'text-muted-foreground'
														)}>
														<span className='truncate flex-1 min-w-0 text-left'>
															{field.value
																? values?.locations.find((location) => location === field.value)
																: 'Valitse sijainti'}
														</span>
														<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent align={'start'} className='p-0'>
												<Command className='max-h-[300px]'>
													<CommandInput placeholder='Hae sijaintia' />
													<CommandList>
														<CommandEmpty>Sijaintia ei löytynyt</CommandEmpty>
														<CommandGroup>
															{values?.locations?.map((location) => (
																<CommandItem
																	value={location}
																	key={location}
																	onSelect={() => {
																		const currentValue = form.getValues('location');
																		form.setValue(
																			'location',
																			currentValue === location ? undefined : location
																		);
																		setOpenEducation(false);
																	}}>
																	<Check
																		className={cn(
																			'mr-2 h-4 w-4',
																			location === field.value ? 'opacity-100' : 'opacity-0'
																		)}
																	/>
																	{location}
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									</FormItem>
								)}
							/>
						)}
						{!isDesktop && (
							<FormField
								control={form.control}
								name='location'
								render={({ field }) => (
									<FormItem className='flex flex-col'>
										<FormLabel>Sijainti (valinnainen)</FormLabel>
										<Drawer open={openLocation} onOpenChange={setOpenLocation}>
											<DrawerTrigger asChild>
												<FormControl>
													<Button
														disabled={loading || valuesLoading}
														variant='outline'
														role='combobox'
														className={cn(
															'w-full items-center justify-between bg-white',
															!field.value && 'text-muted-foreground'
														)}>
														<span className='truncate flex-1 min-w-0 text-left'>
															{field.value
																? values?.locations.find((location) => location === field.value)
																: 'Valitse sijainti'}
														</span>
														<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
													</Button>
												</FormControl>
											</DrawerTrigger>
											<DrawerContent className='p-0 bg-white'>
												<DialogTitle className='px-4 pt-4 text-lg font-semibold'>
													Sijainti (valinnainen)
												</DialogTitle>
												<DialogDescription className='px-4 pb-4 text-sm text-muted-foreground'>
													Valitse sijainti
												</DialogDescription>
												<div className='px-4 py-0'>
													<Command className='max-h-[60vh]'>
														<CommandInput placeholder='Hae sijaintia' className='text-base' />
														<CommandList>
															<CommandEmpty>Sijaintia ei löytynyt</CommandEmpty>
															<CommandGroup>
																{values?.locations?.map((location) => (
																	<CommandItem
																		value={location}
																		key={location}
																		onSelect={() => {
																			const currentValue = form.getValues('location');
																			form.setValue(
																				'location',
																				currentValue === location ? undefined : location
																			);
																			setOpenLocation(false);
																		}}>
																		<Check
																			className={cn(
																				'mr-2 h-4 w-4',
																				location === field.value ? 'opacity-100' : 'opacity-0'
																			)}
																		/>
																		{location}
																	</CommandItem>
																))}
															</CommandGroup>
														</CommandList>
													</Command>
												</div>
											</DrawerContent>
										</Drawer>
									</FormItem>
								)}
							/>
						)}
					</div>
				</div>

				{/* Technologies */}
				<div className='flex-grow flex-shrink basis-1/2 min-w-0'>
					{isDesktop && (
						<FormField
							control={form.control}
							name='technologies'
							render={() => (
								<FormItem className='flex flex-col'>
									<FormLabel>Teknologiat</FormLabel>
									<Popover open={openTechnologies} onOpenChange={setOpenTechnologies}>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													disabled={loading || valuesLoading}
													variant='outline'
													role='combobox'
													className={cn(
														'w-full items-center justify-between bg-white ',
														!form.getValues('technologies').length && 'text-muted-foreground'
													)}>
													<span className='truncate flex-1 min-w-0 text-left'>
														{form.getValues('technologies').length
															? form
																	.getValues('technologies')
																	.map((s) => s)
																	.join(', ')
															: 'Valitse teknologiat'}
													</span>
													<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent align={'start'} className='p-0'>
											<Command className='max-h-[300px]'>
												<CommandInput placeholder='Hae teknologiaa' />
												<CommandList>
													<CommandEmpty>Teknologiaa ei löytynyt</CommandEmpty>
													<CommandGroup>
														{values?.technologies?.map((tech) => {
															const currentValues = form.getValues('technologies') || [];
															return (
																<CommandItem
																	value={tech}
																	key={tech}
																	onSelect={() => {
																		const isSelected = currentValues.includes(tech);
																		const newValues = isSelected
																			? currentValues.filter((t) => t !== tech)
																			: [...currentValues, tech];

																		form.setValue('technologies', newValues, {
																			shouldValidate: true,
																			shouldDirty: true,
																		});
																	}}>
																	<Check
																		className={cn(
																			'mr-2 h-4 w-4',
																			currentValues.includes(tech) ? 'opacity-100' : 'opacity-0'
																		)}
																	/>
																	{tech}
																</CommandItem>
															);
														})}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</FormItem>
							)}
						/>
					)}
					{!isDesktop && (
						<FormField
							control={form.control}
							name='technologies'
							render={() => (
								<FormItem className='flex flex-col'>
									<FormLabel>Teknologiat</FormLabel>
									<Drawer open={openTechnologies} onOpenChange={setOpenTechnologies}>
										<DrawerTrigger asChild>
											<FormControl>
												<Button
													disabled={loading || valuesLoading}
													variant='outline'
													role='combobox'
													className={cn(
														'w-full items-center justify-between bg-white',
														!form.getValues('technologies').length && 'text-muted-foreground'
													)}>
													<span className='truncate flex-1 min-w-0 text-left'>
														{form.getValues('technologies').length
															? form
																	.getValues('technologies')
																	.map((s) => s)
																	.join(', ')
															: 'Valitse teknologiat'}
													</span>
													<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
												</Button>
											</FormControl>
										</DrawerTrigger>
										<DrawerContent className='p-0 bg-white'>
											<DialogTitle className='px-4 pt-4 text-lg font-semibold'>
												Teknologiat
											</DialogTitle>
											<DialogDescription className='px-4 pb-4 text-sm text-muted-foreground'>
												Valitse teknologiat
											</DialogDescription>
											<div className='px-4 py-0'>
												<Command className='max-h-[60vh]'>
													<CommandInput placeholder='Hae teknologiaa' className='text-base' />
													<CommandList>
														<CommandEmpty>Teknologiaa ei löytynyt</CommandEmpty>
														<CommandGroup>
															{values?.technologies?.map((tech) => {
																const currentValues = form.getValues('technologies') || [];
																return (
																	<CommandItem
																		value={tech}
																		key={tech}
																		onSelect={() => {
																			const isSelected = currentValues.includes(tech);
																			const newValues = isSelected
																				? currentValues.filter((t) => t !== tech)
																				: [...currentValues, tech];

																			form.setValue('technologies', newValues, {
																				shouldValidate: true,
																				shouldDirty: true,
																			});
																		}}>
																		<Check
																			className={cn(
																				'mr-2 h-4 w-4',
																				currentValues.includes(tech) ? 'opacity-100' : 'opacity-0'
																			)}
																		/>
																		{tech}
																	</CommandItem>
																);
															})}
														</CommandGroup>
													</CommandList>
												</Command>
											</div>
										</DrawerContent>
									</Drawer>
								</FormItem>
							)}
						/>
					)}
				</div>

				{/* Salary */}
				<FormField
					disabled={loading}
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
				<Button className='w-full' size={'lg'} type='submit' disabled={loading}>
					{loading ? (
						<span className='inline-flex items-center gap-2'>
							<Loader2Icon className='animate-spin' />
							Lasketaan markkina-arvoasi...
						</span>
					) : (
						'Laske markkina-arvoni'
					)}
				</Button>
			</form>
		</Form>
	);
}

export { SalaryForm };
