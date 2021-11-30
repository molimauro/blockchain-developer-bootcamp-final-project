# Design patterns used

## Access Control Design Patterns

- `Ownable` design pattern used in two functions: `pauseContract()` and `unpauseContract()`. These functions do not need to be used by anyone else apart from the contract creator, i.e. the party that is responsible for pausing the contract if needed.

## Optimizing Gas

- `requestsTracker` and `friendsTracker` are two mappings used for accessing directly the requests or the friendships of two addresses instead of looping through the `requests` or `friends` mapping thus consuming more gas.