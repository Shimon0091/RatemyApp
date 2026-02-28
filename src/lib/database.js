import { supabase } from './supabase'

// ======================
// PROPERTIES
// ======================

// Get or create property
export async function getOrCreateProperty(addressData) {
  const { street, buildingNumber, floor, apartment, city } = addressData
  
  // Check if property exists
  const { data: existing, error: searchError } = await supabase
    .from('properties')
    .select('*')
    .eq('street', street)
    .eq('building_number', buildingNumber)
    .eq('floor', floor)
    .eq('apartment', apartment)
    .eq('city', city)
    .single()

  if (existing) {
    return { data: existing, error: null }
  }

  // Create new property
  const { data: newProperty, error: createError } = await supabase
    .from('properties')
    .insert([{
      street,
      building_number: buildingNumber,
      floor,
      apartment,
      city
    }])
    .select()
    .single()

  return { data: newProperty, error: createError }
}

// Get property by ID
export async function getProperty(propertyId) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  return { data, error }
}

// Search properties with filters and pagination
export async function searchProperties(query, options = {}) {
  const {
    minRating = null,
    neighborhood = null,
    minReviews = null,
    sortBy = 'overall_rating',
    ascending = false,
    page = 1,
    pageSize = 20
  } = options

  let dbQuery = supabase
    .from('properties')
    .select('*', { count: 'exact' })

  // Search by street or city
  if (query) {
    // Use the first part (street name) for searching — simplest and most reliable
    const firstPart = query.split(',')[0].trim()
    if (firstPart) {
      dbQuery = dbQuery.or(`street.ilike.%${firstPart}%,city.ilike.%${firstPart}%`)
    }
  }

  // Filter by minimum rating
  if (minRating) {
    dbQuery = dbQuery.gte('overall_rating', minRating)
  }

  // Filter by neighborhood
  if (neighborhood) {
    dbQuery = dbQuery.eq('neighborhood', neighborhood)
  }

  // Filter by minimum review count
  if (minReviews) {
    dbQuery = dbQuery.gte('total_reviews', minReviews)
  }

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  dbQuery = dbQuery
    .order(sortBy, { ascending })
    .range(from, to)

  const { data, error, count } = await dbQuery

  return {
    data,
    error,
    count,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0
  }
}

// Get top rated properties
export async function getTopRatedProperties(limit = 10) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .gte('total_reviews', 3) // At least 3 reviews
    .order('overall_rating', { ascending: false })
    .limit(limit)

  return { data, error }
}

// Get unique neighborhoods (for filter dropdown)
export async function getNeighborhoods() {
  const { data, error } = await supabase
    .from('properties')
    .select('neighborhood')
    .not('neighborhood', 'is', null)
    .order('neighborhood')

  if (error) return { data: [], error }

  // Get unique neighborhoods
  const unique = [...new Set(data.map(p => p.neighborhood))].filter(Boolean)
  return { data: unique, error: null }
}

// ======================
// REVIEWS
// ======================

// Create review
export async function createReview(reviewData) {
  const {
    addressData,
    userId,
    ratings,
    reviewText,
    rentalPeriod,
    monthlyRent,
    tags
  } = reviewData

  // First, get or create the property
  const { data: property, error: propertyError } = await getOrCreateProperty(addressData)
  
  if (propertyError) {
    return { data: null, error: propertyError }
  }

  // Create the review
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert([{
      property_id: property.id,
      user_id: userId,
      overall_rating: ratings.overall,
      maintenance_rating: ratings.maintenance || null,
      communication_rating: ratings.communication || null,
      value_rating: ratings.value || null,
      review_text: reviewText,
      rental_start: rentalPeriod?.start || null,
      rental_end: rentalPeriod?.end || null,
      monthly_rent: monthlyRent || null,
      tags: tags,
      status: 'pending' // Will be approved by admin
    }])
    .select()
    .single()

  return { data: review, error: reviewError }
}

// Get reviews for a property with pagination
export async function getPropertyReviews(propertyId, options = {}) {
  const {
    status = 'approved',
    sortBy = 'created_at',
    ascending = false,
    page = 1,
    pageSize = 20
  } = options

  let query = supabase
    .from('reviews')
    .select(`
      *,
      user_profiles (
        display_name,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('property_id', propertyId)

  if (status) {
    query = query.eq('status', status)
  }

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query
    .order(sortBy, { ascending })
    .range(from, to)

  const { data, error, count } = await query

  return {
    data,
    error,
    count,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0
  }
}

// Get user's reviews
export async function getUserReviews(userId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      properties (
        street,
        building_number,
        floor,
        apartment,
        city
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Update review
export async function updateReview(reviewId, updates) {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single()

  return { data, error }
}

// Delete review
export async function deleteReview(reviewId) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  return { error }
}

// ======================
// REVIEW HELPFULNESS
// ======================

// Vote on review helpfulness
export async function voteReviewHelpfulness(reviewId, userId, isHelpful) {
  // First, check if user already voted
  const { data: existing } = await supabase
    .from('review_helpfulness')
    .select('*')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Update existing vote
    const { error } = await supabase
      .from('review_helpfulness')
      .update({ is_helpful: isHelpful })
      .eq('id', existing.id)

    return { error }
  }

  // Create new vote
  const { error } = await supabase
    .from('review_helpfulness')
    .insert([{
      review_id: reviewId,
      user_id: userId,
      is_helpful: isHelpful
    }])

  // Update helpful counts on review
  if (!error) {
    const field = isHelpful ? 'helpful_count' : 'not_helpful_count'
    await supabase.rpc('increment', {
      row_id: reviewId,
      column_name: field
    })
  }

  return { error }
}

// ======================
// REVIEW REPORTS
// ======================

// Report a review
export async function reportReview(reviewId, userId, reason, details) {
  const { data, error } = await supabase
    .from('review_reports')
    .insert([{
      review_id: reviewId,
      reported_by: userId,
      reason,
      details
    }])
    .select()
    .single()

  // Increment report count on review
  if (!error) {
    await supabase
      .from('reviews')
      .update({ 
        report_count: supabase.raw('report_count + 1')
      })
      .eq('id', reviewId)
  }

  return { data, error }
}

// ======================
// USER PROFILE FUNCTIONS
// ======================

// Get user profile
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

// Check if user is admin
export async function isUserAdmin(userId) {
  const { data, error } = await getUserProfile(userId)
  
  if (error || !data) return false
  
  return data.role === 'admin'
}

// ======================
// ADMIN FUNCTIONS
// ======================

// Get pending reviews (for admin)
export async function getPendingReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      properties (
        street,
        building_number,
        floor,
        apartment,
        city
      ),
      user_profiles (
        display_name,
        avatar_url
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return { data, error }
}

// Approve/Reject review (admin)
export async function moderateReview(reviewId, status, notes = null) {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      status,
      moderation_notes: notes
    })
    .eq('id', reviewId)
    .select()
    .single()

  return { data, error }
}

// Get all reports (admin)
export async function getReports(status = 'pending') {
  const { data, error } = await supabase
    .from('review_reports')
    .select(`
      *,
      reviews (
        *,
        properties (street, building_number, city)
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })

  return { data, error }
}
