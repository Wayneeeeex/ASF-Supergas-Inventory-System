import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Generic pagination bar.
 *
 * @param {number} currentPage  - 1-indexed current page
 * @param {number} totalItems   - total row count before pagination
 * @param {number} pageSize     - rows per page
 * @param {(page: number) => void} onPageChange
 */
export default function Pagination({ currentPage, totalItems, pageSize, onPageChange }) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const goTo = (page) => {
        const clamped = Math.min(Math.max(1, page), totalPages);
        if (clamped !== currentPage) onPageChange(clamped);
    };

    // Build a compact page list: 1 ... current-1, current, current+1 ... last
    const pages = [];
    const addPage = (p) => { if (!pages.includes(p)) pages.push(p); };
    addPage(1);
    for (let p = currentPage - 1; p <= currentPage + 1; p++) {
        if (p > 1 && p < totalPages) addPage(p);
    }
    if (totalPages > 1) addPage(totalPages);
    pages.sort((a, b) => a - b);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100">
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium order-2 sm:order-1">
                Showing <span className="font-semibold text-slate-700">{startItem}–{endItem}</span> of{" "}
                <span className="font-semibold text-slate-700">{totalItems}</span>
            </div>

            <div className="flex items-center gap-1 order-1 sm:order-2 self-end sm:self-auto">
                <button
                    onClick={() => goTo(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={15} />
                </button>

                {pages.map((p, i) => {
                    const prev = pages[i - 1];
                    const showEllipsis = prev !== undefined && p - prev > 1;
                    return (
                        <React.Fragment key={p}>
                            {showEllipsis && (
                                <span className="w-8 h-8 flex items-center justify-center text-slate-300 text-xs select-none">···</span>
                            )}
                            <button
                                onClick={() => goTo(p)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                                    p === currentPage
                                        ? "bg-yellow-400 text-blue-950"
                                        : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                                }`}
                            >
                                {p}
                            </button>
                        </React.Fragment>
                    );
                })}

                <button
                    onClick={() => goTo(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}