/**
 * Smoke tests for the UsersPage component.
 *
 * The API call is mocked via vi.mock so no real server is needed.
 * We verify:
 *  - Loading state renders correctly
 *  - User rows appear after data resolves
 *  - Error state appears when the query fails
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsersPage } from "../routes/users";

// ---------------------------------------------------------------------------
// Mock the api module so no real HTTP call is made
// ---------------------------------------------------------------------------
vi.mock("#/lib/api", () => ({
	api: {
		users: {
			$get: {
				queryOptions: (_args: unknown) => ({
					queryKey: ["users", "$get"],
					queryFn: vi.fn(),
				}),
			},
		},
	},
}));

// ---------------------------------------------------------------------------
// Mock useQuery so we can control what it returns per-test
// ---------------------------------------------------------------------------
const mockUseQuery = vi.fn();
vi.mock("@tanstack/react-query", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@tanstack/react-query")>();
	return {
		...actual,
		useQuery: (opts: unknown) => mockUseQuery(opts),
	};
});

// ---------------------------------------------------------------------------
// Test wrapper
// ---------------------------------------------------------------------------
function Wrapper({ children }: { children: React.ReactNode }) {
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("UsersPage", () => {
	beforeEach(() => {
		mockUseQuery.mockReset();
	});

	it("shows a loading message while data is pending", () => {
		mockUseQuery.mockReturnValue({
			isLoading: true,
			isError: false,
			data: undefined,
		});

		render(<UsersPage />, { wrapper: Wrapper });

		expect(screen.getByText(/loading users/i)).toBeTruthy();
	});

	it("shows an error message when the query fails", () => {
		mockUseQuery.mockReturnValue({
			isLoading: false,
			isError: true,
			data: undefined,
		});

		render(<UsersPage />, { wrapper: Wrapper });

		expect(screen.getByText(/failed to load users/i)).toBeTruthy();
	});

	it("renders user rows when data is available", async () => {
		mockUseQuery.mockReturnValue({
			isLoading: false,
			isError: false,
			data: {
				success: true,
				message: "Users retrieved",
				data: [
					{
						id: "1",
						email: "alice@example.com",
						firstName: "Alice",
						lastName: "Smith",
						role: "admin",
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
					{
						id: "2",
						email: "bob@example.com",
						firstName: "Bob",
						lastName: "Jones",
						role: "user",
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				],
			},
		});

		render(<UsersPage />, { wrapper: Wrapper });

		await waitFor(() => {
			expect(screen.getByText("Alice Smith")).toBeTruthy();
			expect(screen.getByText("alice@example.com")).toBeTruthy();
			expect(screen.getByText("Bob Jones")).toBeTruthy();
			expect(screen.getByText("bob@example.com")).toBeTruthy();
		});
	});

	it("renders the Users heading", () => {
		mockUseQuery.mockReturnValue({
			isLoading: false,
			isError: false,
			data: { success: true, message: "ok", data: [] },
		});

		render(<UsersPage />, { wrapper: Wrapper });

		expect(screen.getByRole("heading", { name: /users/i })).toBeTruthy();
	});
});
