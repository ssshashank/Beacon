type ErrorDebugType = {
    statusCode: number;
    responseBody: Record<string, any>,
    stackTrace: string
};

const errorDebug = (error: any, identityCode: any): ErrorDebugType => {
    const err = new Error();
    const message = `
        Identity Code  📢 :: ${identityCode}
        StackTrace 🚀 :: ${err.stack}
    ` as const;

    const errorResult: ErrorDebugType = {
        statusCode: error?.status,
        responseBody: error.data,
        stackTrace: message,
    };

    return errorResult;
};

export {
    errorDebug
}
