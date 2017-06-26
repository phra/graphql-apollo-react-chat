const query = `
query query($token: String!, $where: ReviewInput, $sortBy: String) {
  query(token: $token) {
    error
    user {
      stats {
        average
        aspects {
          location
        }
        traveledWith {
          FAMILY
          FRIENDS
          COUPLE
          OTHER
        }
      }
      reviews(where: $where, sortBy: $sortBy) {
        _id
        entryDate
        travelDate
        traveledWith
        ratings {
          general {
            general
          }
          aspects {
            location
          }
        }
      }
    }
  }
}
`

export const QUERY = {
  query,
  variables: null,
}
