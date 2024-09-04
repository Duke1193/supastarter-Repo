"use client";

import { Pagination } from "@saas/shared/components/Pagination";
import { UserAvatar } from "@shared/components/UserAvatar";
import { apiClient } from "@shared/lib/api-client";
import { keepPreviousData } from "@tanstack/react-query";
import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
} from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "@ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { Input } from "@ui/components/input";
import { Table, TableBody, TableCell, TableRow } from "@ui/components/table";
import { useToast } from "@ui/hooks/use-toast";
import type { ApiOutput } from "api/trpc/router";
import {
	LoaderIcon,
	MoreVerticalIcon,
	Repeat1Icon,
	SquareUserRoundIcon,
	TrashIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { EmailVerified } from "./EmailVerified";

export function UserList() {
	const t = useTranslations();
	const { toast } = useToast();
	const impersonateMutation = apiClient.admin.impersonate.useMutation();
	const [itemsPerPage] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const deleteUserMutation = apiClient.admin.deleteUser.useMutation();
	const resendVerificationMailMutation =
		apiClient.admin.resendVerificationMail.useMutation();
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useDebounceValue(
		searchTerm,
		500,
		{
			leading: false,
		},
	);

	useEffect(() => {
		setDebouncedSearchTerm(searchTerm);
	}, [searchTerm]);

	const { data, isLoading, refetch } = apiClient.admin.users.useQuery(
		{
			limit: itemsPerPage,
			offset: (currentPage - 1) * itemsPerPage,
			searchTerm: debouncedSearchTerm,
		},
		{
			retry: false,
			refetchOnWindowFocus: false,
			placeholderData: keepPreviousData,
		},
	);

	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearchTerm]);

	const impersonateUser = async (
		userId: string,
		{ name }: { name: string },
	) => {
		const { dismiss } = toast({
			variant: "loading",
			title: t("admin.users.impersonation.impersonating", {
				name,
			}),
		});
		await impersonateMutation.mutateAsync({
			userId,
		});
		await refetch();
		dismiss();
		window.location.href = new URL("/app", window.location.origin).toString();
	};

	const deleteUser = async (id: string) => {
		const deleteUserToast = toast({
			variant: "loading",
			title: t("admin.users.deleteUser.deleting"),
		});
		try {
			await deleteUserMutation.mutateAsync({
				id: id,
			});
			deleteUserToast.update({
				id: deleteUserToast.id,
				variant: "success",
				title: t("admin.users.deleteUser.deleted"),
				duration: 5000,
			});
		} catch {
			deleteUserToast.update({
				id: deleteUserToast.id,
				variant: "error",
				title: t("admin.users.deleteUser.notDeleted"),
				duration: 5000,
			});
		}
	};

	const resendVerificationMail = async (userId: string) => {
		const resendVerificationMailToast = toast({
			variant: "loading",
			title: t("admin.users.resendVerificationMail.submitting"),
		});
		try {
			await resendVerificationMailMutation.mutateAsync({
				userId,
			});
			resendVerificationMailToast.update({
				id: resendVerificationMailToast.id,
				variant: "success",
				title: t("admin.users.resendVerificationMail.success"),
				duration: 5000,
			});
		} catch {
			resendVerificationMailToast.update({
				id: resendVerificationMailToast.id,
				variant: "error",
				title: t("admin.users.resendVerificationMail.error"),
				duration: 5000,
			});
		}
	};

	const columns: ColumnDef<ApiOutput["admin"]["users"]["users"][number]>[] =
		useMemo(
			() => [
				{
					accessorKey: "user",
					header: "",
					accessorFn: (row) => row.name,
					cell: ({ row }) => (
						<div className="flex items-center gap-2">
							<UserAvatar
								name={row.original.name ?? row.original.email}
								avatarUrl={row.original.avatarUrl}
							/>
							<div className="leading-tight">
								<strong className="block">
									{row.original.name ?? row.original.email}
								</strong>
								<small className="text-muted-foreground">
									{!!row.original.name && row.original.email}{" "}
									<EmailVerified
										verified={row.original.emailVerified}
										className="inline-block align-text-top"
									/>
									{row.original.role === "ADMIN" ? " – Admin" : ""} – Teams:{" "}
									{row.original.memberships?.map((mebership, i) => {
										return (
											<span key={i}>
												{i > 0 && <span>, </span>}
												{mebership.team.name}
											</span>
										);
									})}
								</small>
							</div>
						</div>
					),
				},
				{
					accessorKey: "actions",
					header: "",
					cell: ({ row }) => {
						return (
							<div className="flex flex-row justify-end gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button size="icon" variant="ghost">
											<MoreVerticalIcon className="size-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem
											onClick={() =>
												impersonateUser(row.original.id, {
													name: row.original.name ?? "",
												})
											}
										>
											<SquareUserRoundIcon className="mr-2 size-4" />
											{t("admin.users.impersonate")}
										</DropdownMenuItem>

										{!row.original.emailVerified && (
											<DropdownMenuItem
												onClick={() => resendVerificationMail(row.original.id)}
											>
												<Repeat1Icon className="mr-2 size-4" />
												{t("admin.users.resendVerificationMail.title")}
											</DropdownMenuItem>
										)}

										<DropdownMenuItem
											onClick={() => deleteUser(row.original.id)}
										>
											<span className="flex items-center text-destructive hover:text-destructive">
												<TrashIcon className="mr-2 size-4" />
												{t("admin.users.delete")}
											</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						);
					},
				},
			],
			[],
		);

	const users = useMemo(() => data?.users ?? [], [data?.users]);

	const table = useReactTable({
		data: users,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		manualPagination: true,
		state: {
			sorting,
			columnFilters,
		},
	});

	return (
		<div className="rounded-lg bg-card p-6 shadow-sm ">
			<h2 className="mb-4 font-semibold text-2xl">{t("admin.users.title")}</h2>
			<Input
				type="search"
				placeholder={t("admin.users.search")}
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="mb-4"
			/>

			<div className="rounded-md border">
				<Table>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="group"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className="py-2 group-first:rounded-t-md group-last:rounded-b-md"
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									{isLoading ? (
										<div className="flex h-full items-center justify-center">
											<LoaderIcon className="mr-2 size-4 animate-spin text-primary" />
											{t("admin.users.loading")}
										</div>
									) : (
										<p>No results.</p>
									)}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{users.length > 0 && (
				<Pagination
					className="mt-4"
					totalItems={data?.total ?? 0}
					itemsPerPage={itemsPerPage}
					currentPage={currentPage}
					onChangeCurrentPage={setCurrentPage}
				/>
			)}
		</div>
	);
}
