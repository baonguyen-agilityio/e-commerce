export const ErrorMessages = {
    USER_NOT_FOUND: "We couldn't find this user in our system.",
    AUTH_REQUIRED: "Please sign in to access this feature.",
    INSUFFICIENT_PERMISSIONS: "You don't have the necessary permissions to perform this action.",
    CANNOT_MODIFY_SELF: "You aren't allowed to change your own role.",
    SUPER_ADMIN_CANNOT_BE_DEMOTED: "The SUPER_ADMIN role is permanent and cannot be demoted.",
    ONLY_SUPER_ADMIN_CAN_PROMOTE_TO_OR_DEMOTE_ADMIN: "Only a Super Admin has the authority to promote or demote other Admins.",
    CANNOT_PROMOTE_TO_SUPER_ADMIN: "Assigning the SUPER_ADMIN role is not allowed.",
    CANNOT_MODIFY_HIGHER_ROLE: "You don't have permission to modify users with an equal or higher role.",
    CANNOT_PROMOTE_TO_HIGHER_ROLE: "You cannot promote a user to your level or higher.",
    CANNOT_DEMOTE_LAST_ADMIN: "The system needs at least one Admin. Please promote someone else before demoting the current one.",
    CANNOT_DELETE_SUPER_ADMIN: "The Super Admin account cannot be deleted.",
    CANNOT_DELETE_USER_WITH_HIGHER_ROLE: "You don't have permission to delete users with an equal or higher role.",
    CANNOT_DELETE_LAST_ADMIN: "We can't delete the last Admin. Please appoint a new Admin first.",
    FAILED_TO_DELETE_USER_FROM_CLERK: "There was a problem syncing with the authentication service while deleting the user.",
    CANNOT_BAN_USER_WITH_HIGHER_ROLE: "You don't have authority to ban users with an equal or higher role.",
    CANNOT_LOCK_USER_WITH_HIGHER_ROLE: "You don't have authority to lock users with an equal or higher role.",

    CART_NOT_FOUND: "We couldn't retrieve your shopping cart.",
    CART_ITEM_NOT_FOUND: "This item is no longer in your cart.",
    INSUFFICIENT_STOCK: "Sorry, we don't have enough stock for one or more items in your cart.",
    PRODUCT_NOT_FOUND_OR_NOT_AVAILABLE: "This product is currently unavailable or doesn't exist.",
    INSUFFICIENT_STOCK_FOR_REQUESTED_PRODUCT: "We don't have enough items in stock to fulfill your request.",

    CART_EMPTY: "Your cart is currently empty. Time to go shopping!",
    PAYMENT_FAILED: "The payment didn't go through. Please check your details and try again.",
    ORDER_NOT_FOUND: "We couldn't find the order you're looking for.",
    NOT_AUTHORIZED_TO_VIEW_ORDER: "You don't have permission to view this order's details.",

    PRODUCT_NOT_FOUND: "We couldn't find the product you're looking for.",

    CATEGORY_NOT_FOUND: "The requested category doesn't exist.",
    CATEGORY_HAS_PRODUCTS: "This category still has products. Please move or delete the products before removing the category.",
} as const;