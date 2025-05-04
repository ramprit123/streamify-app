/**
 * Pagination middleware to handle query parameters and add pagination data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const paginateResults = (defaultLimit = 10) => {
  return (req, res, next) => {
    // Get page and limit from query parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || defaultLimit);

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Add pagination data to request object
    req.pagination = {
      page,
      limit,
      skip,
    };

    // Extend response object with paginate method
    res.paginate = function (data, totalItems) {
      const totalPages = Math.ceil(totalItems / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        results: data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null
        }
      };
    };

    next();
  };
};