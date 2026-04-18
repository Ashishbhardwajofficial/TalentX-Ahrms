package com.talentx.hrms.util;

import com.talentx.hrms.common.PaginationRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Utility class for consistent pagination handling across the application
 * Ensures all pagination operations follow the same patterns and standards
 */
public class PaginationUtils {

    /**
     * Default page size when not specified
     */
    public static final int DEFAULT_PAGE_SIZE = 10;

    /**
     * Default page number when not specified (0-based)
     */
    public static final int DEFAULT_PAGE_NUMBER = 0;

    /**
     * Default sort direction when not specified
     */
    public static final String DEFAULT_SORT_DIRECTION = "asc";

    /**
     * Maximum allowed page size to prevent performance issues
     */
    public static final int MAX_PAGE_SIZE = 100;

    /**
     * Create a Pageable object from PaginationRequest with consistent handling
     * 
     * @param paginationRequest the pagination request parameters
     * @return Pageable object for use with Spring Data repositories
     */
    public static Pageable createPageable(PaginationRequest paginationRequest) {
        if (paginationRequest == null) {
            return PageRequest.of(DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);
        }

        int page = Math.max(0, paginationRequest.getPage()); // Ensure non-negative
        int size = Math.min(Math.max(1, paginationRequest.getSize()), MAX_PAGE_SIZE); // Ensure between 1 and MAX_PAGE_SIZE

        Sort sort = createSort(paginationRequest.getSortBy(), paginationRequest.getSortDirection());
        
        return PageRequest.of(page, size, sort);
    }

    /**
     * Create a Sort object with consistent direction handling
     * 
     * @param sortBy the field to sort by
     * @param sortDirection the sort direction (asc/desc, case insensitive)
     * @return Sort object, or Sort.unsorted() if sortBy is null/empty
     */
    public static Sort createSort(String sortBy, String sortDirection) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            return Sort.unsorted();
        }

        Sort.Direction direction = parseSortDirection(sortDirection);
        return Sort.by(direction, sortBy.trim());
    }

    /**
     * Parse sort direction string to Sort.Direction enum
     * Handles case insensitivity and defaults to ASC for invalid values
     * 
     * @param sortDirection the sort direction string
     * @return Sort.Direction enum value
     */
    public static Sort.Direction parseSortDirection(String sortDirection) {
        if (sortDirection == null || sortDirection.trim().isEmpty()) {
            return Sort.Direction.ASC;
        }

        String direction = sortDirection.trim().toLowerCase();
        return "desc".equals(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
    }

    /**
     * Validate pagination parameters and return normalized PaginationRequest
     * 
     * @param page page number (0-based)
     * @param size page size
     * @param sortBy sort field
     * @param sortDirection sort direction
     * @return normalized PaginationRequest
     */
    public static PaginationRequest validateAndNormalize(int page, int size, String sortBy, String sortDirection) {
        int normalizedPage = Math.max(0, page);
        int normalizedSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        String normalizedSortDirection = sortDirection != null ? sortDirection.trim() : DEFAULT_SORT_DIRECTION;
        String normalizedSortBy = sortBy != null ? sortBy.trim() : null;

        return new PaginationRequest(normalizedPage, normalizedSize, normalizedSortBy, normalizedSortDirection);
    }

    /**
     * Create default pagination request with standard values
     * 
     * @return PaginationRequest with default values
     */
    public static PaginationRequest createDefault() {
        return new PaginationRequest(DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, null, DEFAULT_SORT_DIRECTION);
    }

    /**
     * Create pagination request with custom page and size, default sorting
     * 
     * @param page page number (0-based)
     * @param size page size
     * @return PaginationRequest with specified page/size and default sorting
     */
    public static PaginationRequest create(int page, int size) {
        return validateAndNormalize(page, size, null, DEFAULT_SORT_DIRECTION);
    }

    /**
     * Create pagination request with all parameters
     * 
     * @param page page number (0-based)
     * @param size page size
     * @param sortBy sort field
     * @param sortDirection sort direction
     * @return normalized PaginationRequest
     */
    public static PaginationRequest create(int page, int size, String sortBy, String sortDirection) {
        return validateAndNormalize(page, size, sortBy, sortDirection);
    }

    /**
     * Check if pagination parameters are valid
     * 
     * @param page page number
     * @param size page size
     * @return true if parameters are valid
     */
    public static boolean isValidPagination(int page, int size) {
        return page >= 0 && size > 0 && size <= MAX_PAGE_SIZE;
    }

    /**
     * Get the maximum allowed page size
     * 
     * @return maximum page size
     */
    public static int getMaxPageSize() {
        return MAX_PAGE_SIZE;
    }
}

