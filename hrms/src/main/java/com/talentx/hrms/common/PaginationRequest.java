package com.talentx.hrms.common;

/**
 * Request object for pagination parameters with validation and defaults
 * Ensures consistent pagination behavior across all endpoints
 */
public class PaginationRequest {
    private int page = 0;
    private int size = 10;
    private String sortBy;
    private String sortDirection = "asc";

    public PaginationRequest() {}

    public PaginationRequest(int page, int size) {
        this.page = Math.max(0, page); // Ensure non-negative
        this.size = Math.min(Math.max(1, size), 100); // Ensure between 1 and 100
    }

    public PaginationRequest(int page, int size, String sortBy, String sortDirection) {
        this.page = Math.max(0, page); // Ensure non-negative
        this.size = Math.min(Math.max(1, size), 100); // Ensure between 1 and 100
        this.sortBy = sortBy != null ? sortBy.trim() : null;
        this.sortDirection = sortDirection != null ? sortDirection.trim() : "asc";
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = Math.max(0, page); // Ensure non-negative
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = Math.min(Math.max(1, size), 100); // Ensure between 1 and 100
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy != null ? sortBy.trim() : null;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection != null ? sortDirection.trim() : "asc";
    }

    /**
     * Check if sorting is requested
     * @return true if sortBy is not null and not empty
     */
    public boolean hasSorting() {
        return sortBy != null && !sortBy.isEmpty();
    }

    /**
     * Check if sort direction is descending
     * @return true if sort direction is "desc" (case insensitive)
     */
    public boolean isDescending() {
        return "desc".equalsIgnoreCase(sortDirection);
    }

    /**
     * Validate pagination parameters
     * @return true if all parameters are valid
     */
    public boolean isValid() {
        return page >= 0 && size > 0 && size <= 100;
    }

    @Override
    public String toString() {
        return String.format("PaginationRequest{page=%d, size=%d, sortBy='%s', sortDirection='%s'}", 
                           page, size, sortBy, sortDirection);
    }
}

