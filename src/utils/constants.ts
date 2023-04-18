export const getPaginationParams = (page, perPage) => {
    page = +page ?? 1
    perPage = +perPage ?? 10
    const skip = perPage * page - perPage
    return { limit: perPage, skip }
}
