function validateQuotationDraft(parsed) {
    if (!parsed || typeof parsed !== "object") {
        throw new Error("VALIDATION_FAILED: response is not an object");
    }

    if (!Array.isArray(parsed.suggested_items) || parsed.suggested_items.length === 0) {
        throw new Error("VALIDATION_FAILED: suggested_items missing or empty");
    }

    const safeItems = parsed.suggested_items.map((item, idx) => {
        if (!item.title || typeof item.title !== "string") {
            throw new Error(`VALIDATION_FAILED: item ${idx} missing a title`);
        }

        const quantity = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;

        const estimated_hours =
            typeof item.estimated_hours === "number" && item.estimated_hours >= 0
                ? item.estimated_hours
                : 0;

        // Only accept a numeric, non-negative unit price. Anything else -> null.
        // Also treat 0 as "unknown" here since a real BHD price of 0 is not meaningful
        // for a paid line item — adjust this line if 0 should ever be a valid price for you.
        const unitprice =
            typeof item.unitprice === "number" && item.unitprice > 0
                ? Math.round(item.unitprice * 1000) / 1000  // BHD commonly uses 3 decimal places
                : null;

        const totalprice = unitprice !== null
            ? Math.round(unitprice * quantity * 1000) / 1000
            : null;

        return {
            title: item.title.trim(),
            description: typeof item.description === "string" ? item.description.trim() : "",
            quantity,
            estimated_hours,
            unitprice,
            totalprice
        };
    });

    return {
        project_type: typeof parsed.project_type === "string" ? parsed.project_type : "General Quotation",
        suggested_items: safeItems,
        questions_to_ask_client: Array.isArray(parsed.questions_to_ask_client)
            ? parsed.questions_to_ask_client.filter(q => typeof q === "string")
            : [],
        summary: typeof parsed.summary === "string" ? parsed.summary : ""
    };
}

module.exports = { validateQuotationDraft };