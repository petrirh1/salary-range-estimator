import { useMediaQuery } from '@react-hook/media-query';
import { FormField, FormItem, FormLabel } from './form';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './command';
import { Drawer, DrawerContent, DrawerTrigger } from './drawer';
import { DialogDescription, DialogTitle } from './dialog';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { SalaryFormValues } from './salary-form';
import type { Path, UseFormReturn } from 'react-hook-form';

interface ComboboxProps {
	form: UseFormReturn<SalaryFormValues>;
	multiple?: boolean;
	loading: boolean;
	valuesLoading: boolean;
	values: string[] | undefined;
	fieldName: Path<SalaryFormValues>;
	label: string;
	defaultLabel: string;
	placeholder: string;
	noResultsText: string;
}

function Combobox({
	form,
	multiple = false,
	values,
	fieldName,
	loading,
	valuesLoading,
	label,
	defaultLabel,
	placeholder,
	noResultsText,
}: ComboboxProps) {
	const [isOpen, setIsOpen] = useState(false);
	const isDesktop = useMediaQuery('(min-width: 768px)');

	const renderButtonLabel = (field: any) => {
		if (multiple) {
			const currentValues = Array.isArray(field.value) ? field.value : [];
			return currentValues.length ? (
				currentValues.join(', ')
			) : (
				<span className='text-muted-foreground'>{defaultLabel}</span>
			);
		} else {
			return field.value ? values?.find((v) => v === field.value) : defaultLabel;
		}
	};

	const renderCommandItems = (field: any) => {
		if (!values) return null;

		if (multiple) {
			const currentValues = Array.isArray(field.value) ? field.value : [];
			return values.map((value) => (
				<CommandItem
					key={value}
					value={value}
					onSelect={() => {
						const isSelected = currentValues.includes(value);
						const newValues = isSelected
							? currentValues.filter((v: string) => v !== value)
							: [...currentValues, value];
						form.setValue(fieldName, newValues, { shouldValidate: true, shouldDirty: true });
					}}>
					<Check
						className={cn(
							'mr-2 h-4 w-4',
							currentValues.includes(value) ? 'opacity-100' : 'opacity-0'
						)}
					/>
					{value}
				</CommandItem>
			));
		} else {
			const val = field.value;
			return values.map((value) => (
				<CommandItem
					key={value}
					value={value}
					onSelect={() => {
						form.setValue(fieldName, val === value ? undefined : value, { shouldValidate: true });
						setIsOpen(false);
					}}>
					<Check className={cn('mr-2 h-4 w-4', value === val ? 'opacity-100' : 'opacity-0')} />
					{value}
				</CommandItem>
			));
		}
	};

	return (
		<FormField
			control={form.control}
			name={fieldName}
			render={({ field, fieldState }) => {
				const hasError = !!fieldState.error;
				const TriggerButton = (
					<Button
						ref={field.ref}
						disabled={loading || valuesLoading}
						variant='outline'
						role='combobox'
						className={cn(
							'w-full items-center justify-between bg-white border',
							!field.value && 'text-muted-foreground',
							hasError && 'border-red-500'
						)}>
						<span className='truncate flex-1 min-w-0 text-left'>{renderButtonLabel(field)}</span>
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				);

				return (
					<FormItem className='flex flex-col'>
						<FormLabel>{label}</FormLabel>

						{isDesktop ? (
							<Popover open={isOpen} onOpenChange={setIsOpen}>
								<PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
								<PopoverContent align='start' className='p-0'>
									<Command className='max-h-[300px]'>
										<CommandInput placeholder={placeholder} />
										<CommandList>
											<CommandEmpty>{noResultsText}</CommandEmpty>
											<CommandGroup>{renderCommandItems(field)}</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						) : (
							<Drawer open={isOpen} onOpenChange={setIsOpen}>
								<DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
								<DrawerContent className='p-0 bg-white'>
									<DialogTitle className='px-4 pt-4 text-lg font-semibold'>{label}</DialogTitle>
									<DialogDescription className='px-4 pb-4 text-sm text-muted-foreground'>
										{defaultLabel}
									</DialogDescription>
									<div className='px-4 py-0'>
										<Command className='max-h-[60vh]'>
											<CommandInput placeholder={placeholder} className='text-base' />
											<CommandList>
												<CommandEmpty>{noResultsText}</CommandEmpty>
												<CommandGroup>{renderCommandItems(field)}</CommandGroup>
											</CommandList>
										</Command>
									</div>
								</DrawerContent>
							</Drawer>
						)}
					</FormItem>
				);
			}}
		/>
	);
}

export { Combobox };
