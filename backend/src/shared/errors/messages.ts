export const ErrorMessages = {
    USER_NOT_FOUND: "User not found",
    CANNOT_MODIFY_SELF: "You cannot change your own role",
    SUPER_ADMIN_CANNOT_BE_DEMOTED: "SUPER_ADMIN role cannot be demoted",
    ONLY_SUPER_ADMIN_CAN_PROMOTE_TO_OR_DEMOTE_ADMIN: "Only Super Admin can promote to or demote Admin",
    CANNOT_PROMOTE_TO_SUPER_ADMIN: "Cannot promote a user to SUPER_ADMIN",
    CANNOT_MODIFY_HIGHER_ROLE: "Cannot modify user with equal or higher role",
    CANNOT_PROMOTE_TO_HIGHER_ROLE: "Cannot promote user to your level or higher",
    CANNOT_DEMOTE_LAST_ADMIN: "Cannot demote the last Admin. Promote another user first.",
    CANNOT_DELETE_SUPER_ADMIN: "Cannot delete SUPER_ADMIN",
    CANNOT_DELETE_USER_WITH_HIGHER_ROLE: "Cannot delete user with equal or higher role",
    CANNOT_DELETE_LAST_ADMIN: "Cannot delete the last Admin. Promote another user first.",
    FAILED_TO_DELETE_USER_FROM_CLERK: "Failed to delete user from Clerk",
    CANNOT_BAN_USER_WITH_HIGHER_ROLE: "Cannot ban user with equal or higher role",
    CANNOT_LOCK_USER_WITH_HIGHER_ROLE: "Cannot lock user with equal or higher role",

    CART_NOT_FOUND: "Cart not found",
    CART_ITEM_NOT_FOUND: "Cart item not found",
    INSUFFICIENT_STOCK: "Insufficient stock",
    PRODUCT_NOT_FOUND_OR_NOT_AVAILABLE: "Product not found or not available",
    INSUFFICIENT_STOCK_FOR_REQUESTED_PRODUCT: "Insufficient stock for the requested product",

    CART_EMPTY: "Cart is empty",
    PAYMENT_FAILED: "Payment failed",
    ORDER_NOT_FOUND: "Order not found",
    NOT_AUTHORIZED_TO_VIEW_ORDER: "Not authorized to view this order",

    PRODUCT_NOT_FOUND: "Product not found",

    CATEGORY_NOT_FOUND: "Category not found",
    CATEGORY_HAS_PRODUCTS: "Cannot delete category. It has associated products. Please remove or reassign the products first.",
} as const;