# Algorithm Interview Questions

Based on concepts used in your Anime Explorer app.

---

## 1. Sorting

### Easy
- **Sort array in ascending order**
  ```javascript
  // Input: [3, 1, 4, 1, 5, 9]
  // Output: [1, 1, 3, 4, 5, 9]

  function sortArr(arr) {
    result [...arr].sort((a, b) => a - b);
  }
  ```

- **Sort array of objects by property**
  ```javascript
  // Input: [{name: "A", score: 90}, {name: "B", score: 80}]
  // Sort by score descending → [{name: "A", score: 90}, {name: "B", score: 80}]
  function sortArr(arr, key, order ="asc") {
        return [...arr].sort((a, b) => {
            if (order === "asc") return a[key] - b[key];
            return b[key] - a[key];
        })
    }

  or 

  function sortArr(arrObj) {
        return [...arrObj].sort((a, b) => b.score - a.score);
    }
  ```

### Medium
- **Find kth smallest element**
  ```javascript
  // Input: [7, 10, 4, 3, 20, 15], k=3
  // Output: 7 (3rd smallest)

  function findSmallest(arr, k) {
    for (let i = 0; i < arr.length; i++) {
        let count = 0;
        for (let j = 0; j < arr.length; j++) {
            if(arr[j] < arr[i]) count++;
        }
        if (count === k - 1) return arr[i];
    }
    return -1
  }

  or 

  function findSmallest(arr, k) {
    arr.sort((a, b) => a -b);
    return arr[k -1];
  }
  ```

- **Sort by frequency**
  ```javascript
  // Input: [1, 2, 2, 3, 1, 2]
  // Output: [2, 2, 2, 1, 1, 3] (sorted by frequency)

  function freqSort(arr) {
    const freq = {};
    for (let num of arr) {
        freq[num] = (freq[num] || 0) + 1;
    }
    <!-- return freq; -->
    <!-- console.log(freqSort([1, 2, 2, 3, 1, 2])); -->

    arr.sort((a, b) => {
        if (freg[b] !=== freg[a]) {
            return freq[b] - freq[a];
        } 
        return a - b;
    });

    return arr;
  }
  ```

### Hard
- **Sort colors (Dutch national flag)**
  ```javascript
  // Input: ["red", "blue", "green", "red", "green"]
  // Group by type: ["red", "red", "blue", "green", "green"]

  function sortColor(arr) {
    const freq = {};

    for (let color of arr) {
       freq[color] = (freq[color] || 0) + 1;
    }

    const result = [];
    const count = {};

    for (let color of arr ) {
        count[color] = (count[color] || 0) + 1;
    }

    const uniqueColors = Object.keys(count);
    uniqueColors.sort((a, b) => count[b] - count[a]);

    for (let color of uniqueColors) {
        for (let i = 0; i < count[color]; i++) {
            result.push(color);
        }
    }
    return result;
  }

  console.log(sortColor(["red", "blue", "green", "red", "green"])); // ["red", "red", "blue", "green", "green"]
  ```

---

## 2. Searching

### Easy
- **Linear search**
  ```javascript
  // Find index of target in array
  // [1, 3, 5, 7], target=5 → index 2

   function searchArr(arr, t) {
    for (let i = 0; i < arr.length; i++) {
        if (t === arr[i]) {
            return i;
        }
    }
    return "no such number in array";
  }

  console.log(searchArr([1, 3, 5, 7], 5)); // 2
  ```

- **Binary search**
  ```javascript
  // [1, 3, 5, 7, 9], target=7 → index 3

   function searchArr(arr, t) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (arr[mid] === t) {
            return mid; // Found!
        } else if (arr[mid] < t) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }

    }
        return "Target number not found!" 

  }


  console.log(searchArr([1, 3, 5, 7, 9], 7)); // 3
  ```

### Medium
- **Search in rotated sorted array**
  ```javascript
  // [4, 5, 6, 7, 0, 1, 2], target=0 → index 4

   function sortArr(arr) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor ((left + right) /2);
    }
    
     if (arr[mid] === target) {
      return mid;
    }

    // Determine which half is sorted
    if (arr[left] <= arr[mid]) {
      // Left half is sorted
      if (arr[left] <= target && target < arr[mid]) {
        right = mid - 1;  // Target in left sorted half
      } else {
        left = mid + 1;   // Target in right half
      }
    } else {
      // Right half is sorted
      if (arr[mid] < target && target <= arr[right]) {
        left = mid + 1;   // Target in right sorted half
      } else {
        right = mid - 1;  // Target in left half
      }
    }
   }

     console.log(searchArr([4, 5, 6, 7, 0, 1, 2], 0)); // 4
  ```

- **Find first and last position** (OMG, what?!)
  ```javascript
  // [2, 4, 4, 4, 4, 6, 8], target=4
  // Output: [1, 4] (first and last index)

    function position(arr, target) {
    // Find first position
    let first = -1;
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] >= target) {
        if (arr[mid] === target) first = mid;
        right = mid - 1;
        } else {
        left = mid + 1;
        }
    }
    
    // Find last position
    let last = -1;
    left = 0; right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] <= target) {
        if (arr[mid] === target) last = mid;
        left = mid + 1;
        } else {
        right = mid - 1;
        }
    }
    
    return [first, last];
    }

    console.log(position([2, 4, 4, 4, 4, 6, 8], 4)); // [1, 4]
  ```

### Hard
- **Median of two sorted arrays**
  ```javascript
  // [1, 3], [2] → median = 2
  // [1, 2], [3, 4] → median = (2+3)/2 = 2.5
  ```

---

## 3. Filtering

### Easy
- **Filter even numbers**
  ```javascript
  // [1, 2, 3, 4, 5, 6] → [2, 4, 6]
    function fillterNum(arr) {
        return arr.filter(num => num % 2 === 0);
    }

    console.log(fillterNum([1, 2, 3, 4, 5, 6])) // [2, 4, 6]
  ```

- **Filter unique values**
  ```javascript
  // [1, 2, 2, 3, 3, 3] → [1, 2, 3]

  function uniqueNum(arr) {
   const seen = {};

   for (let num of arr) {
    if (!seen[num]) {
        seen[num] = true;
    }
   }
   return Object.keys(seen).map(Number);
  }

  console.log(uniqueNum([1, 2, 2, 3, 3, 3])) // [1, 2, 3]
  ```

### Medium
- **Filter by multiple criteria**
  ```javascript
  // Animes: [{title: "Naruto", rating: 8}, {title: "DBZ", rating: 7}]
  // Filter: rating >= 8 → [{title: "Naruto", rating: 8}]
  ```

- **Partition array**
  ```javascript
  // [3, 1, 4, 1, 5, 9, 2, 6]
  // Partition by 5 → [3, 1, 4, 1, 2, 5, 9, 6]
  ```

---

## 4. Deduplication (YOUR APP HAS THIS!)

### Easy
- **Remove duplicates from sorted array**
  ```javascript
  // [1, 1, 2, 2, 3, 3] → [1, 2, 3] (in-place)

  function deduplicate(arr) {
   let WriteIndex = 0;

   for (let i = 0; i < arr.length; i++) {
    if (i === 0 || arr[i] !== arr[i - 1]) {
        arr[WriteIndex] = arr[i];
        WriteIndex++;
    }
   }

   arr.length = WriteIndex;

   return arr;
  }

  console.log(deduplicate([1, 1, 2, 2, 3, 3]));
  ```

### Medium
- **Remove duplicates from unsorted array**
  ```javascript
  // [3, 1, 4, 1, 5, 9, 2, 6] → [3, 1, 4, 5, 9, 2, 6]
  // Hint: Use Set or Map like your app does!
  function deduplicate(arr) {
    return Array.from(new Map(arr.map(item => [item, item])).values());
  }

   console.log(deduplicate([3, 1, 4, 1, 5, 9, 2, 6]));
  ```

- **Your App's Approach - Set-based deduplication:**
  ```typescript
  // What you use in AnimeContext.tsx
  const seen = new Set(prev.map((a) => a.id));
  const unique = data.filter((a) => !seen.has(a.id));
  ```

- **Your App's Approach - Map-based deduplication:**
  ```typescript
  // What you use in AnimeMainList.tsx
  const unique = Array.from(new Map(arr.map(a => [a.id, a])).values());
  ```

### Hard
- **Remove duplicates with max frequency constraint**
  ```javascript
  // Given k, remove elements that appear more than k times
  // ["a", "a", "b", "b", "b"], k=2 → ["a", "a", "b"]
  ```

---

## 5. Memoization

### Easy
- **Memoize a function**
  ```javascript
  // Create a memoized version of a function
  const memoize = (fn) => {
    // Your implementation
    const cache = {};

    return (...args) => {
        const key = JSON.stringigy(args);

        if (cache[key]) {
            return cache[key];
        }
        
        const result = fn(...args);
        cache[key] = result;
        return result;
    }
  };
  ```

### Medium
- **Fibonacci with memoization**
  ```javascript
  // fib(5) = 5
  // fib(10) = 55
  // Optimize using memoization!

    const fibonacci = function(num) {
    if (num <= 1) return num;
    return fibonacci(num - 1) + fibonacci(num - 2);
    };

    console.log(fibonacci(5)); 
  ```

- **Your App's Approach - Cache-aside pattern:**
  ```typescript
  // What you use in AnimeContext.tsx for animeById
  const fetchAnimeById = async (id: number) => {
    if (animeById[id]) return;  // Cache hit!
    const anime = await fetchAnimeByIdApi(id);
    setAnimeById((prev) => ({ ...prev, [id]: anime }));
  };
  ```

### Hard
- **LRU Cache implementation**
  ```javascript
  // Design a Least Recently Used cache
  // Operations: get(key), put(key, value)
  // When full, remove least recently used
  ```

---

## 6. Pagination (YOUR APP HAS THIS!)

### Easy
- **Slice array for page**
  ```javascript
  // [1,2,3,4,5,6], page=2, size=2 → [3, 4]
    function pagination(arr, page, size) {
    const start = (page - 1) * size;
    const end = start + size;
    return arr.slice(start, end);
    }

    console.log(pagination([1,2,3,4,5,6], 2, 2));  // [3, 4] ✓

  ```

### Medium
- **Implement pagination logic**
  ```javascript
  // getPage(items, pageNumber, pageSize)
  // [1,2,3,4,5,6,7,8], page=2, size=3 → [4, 5, 6]
  // Also return: totalPages, hasNext, hasPrev

    function getPage(item, pageNumber, pageSize) {
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems/ pageSize);

        const start = (startNumber - 1) * pageSize;
        const end = start + pageSize;
        const data = items.slice(start, end);

        return {
            data,
            totalPages,
            hasNext: pageNumber < totalPages,
            hasPrev: pageNumber > 1,
            page: pageNumber,
            pageSize: pageSize,
            totalItems
        }
    }

    console.log(getPage([1,2,3,4,5,6,7,8], 2, 3)) // [4, 5, 6]
  ```

- **Your App's Approach - Page tracking with Set:**
  ```typescript
  // What you use in AnimeContext.tsx
  const fetchedPagesRef = useRef(new Set());
  const fetchNextPage = () => {
    if (fetchedPagesRef.current.has(page)) return;  // Prevent dupes!
    fetchedPagesRef.current.add(page);
  };
  ```

### Hard
- **Infinite scroll implementation**
  ```javascript
  // Fetch more when element comes into viewport
  // Using IntersectionObserver pattern
  ```

---

## 7. Caching (YOUR APP HAS THIS!)

### Easy
- **Simple cache get/set**
  ```javascript
  const cache = {};
  const get = (key) => cache[key];
  const set = (key, value) => cache[key] = value;

  const cacheWithTTL = () => {
    const cache = {};
    const ttl = 5000;

    const set = (key, value) => {
        cache[key] = { value, timestamp: Date.now() };
    }

    const get = (key) => {
        const item = cache[key];
        if (!item) return null;
        if (Date.now() - item.timestamp > ttl) {
            delete cache[key];
            return nulll
        }
        return item.value
    }
  }
  ```

### Medium
- **Cache with TTL (Time To Live)**
  ```javascript
  // Items expire after specified time
  const cache = createCacheWithTTL(5000); // 5 seconds
  cache.set("key", "value");
  setTimeout(() => cache.get("key"), 6000); // → null (expired)
  ```

- **Your App's Approach - LocalStorage persistence:**
  ```typescript
  // What you use in FavouritesContext.tsx
  const [favourites, setFavourites] = useState(() => {
    const stored = localStorage.getItem("favourites");
    return stored ? JSON.parse(stored) : [];
  });
  ```

- **Your App's Approach - Cross-tab sync:**
  ```typescript
  // Sync between browser tabs
  window.addEventListener("storage", (e) => {
    if (e.key === "favourites") {
      setFavourites(JSON.parse(e.newValue));
    }
  });
  ```

### Hard
- **Implement LRU Cache with O(1) operations**
  ```javascript
  // LRUCache(capacity)
  // get(key) → value (O(1))
  // put(key, value) (O(1))
  // When full, evict least recently used
  ```

---

## Combined Challenges (Like Your App!)

### Challenge 1: Search + Pagination + Deduplication
```javascript
// Implement search with:
// - Debounced input (rate limiting)
// - Pagination (page-based)
// - Deduplicate results
// - Caching (memoize previous searches)
```

### Challenge 2: Filter + Sort + Pagination
```javascript
// Build a table component that:
// - Filters data by multiple criteria
// - Sorts by any column (asc/desc)
// - Paginates results
// - Caches filtered/sorted results
```

### Challenge 3: Infinite Scroll + Caching
```javascript
// Implement infinite scroll that:
// - Fetches pages as user scrolls
// - Caches loaded pages in memory
// - Deduplicates across pages
// - Prevents duplicate fetches
```

---

## Quick Reference - Your App's Patterns

| Concept | Your Implementation |
|---------|-------------------|
| **Debounce** | 250ms delay on search input |
| **Set dedup** | `new Set(prev.map(a => a.id))` |
| **Map dedup** | `new Map(arr.map(a => [a.id, a]))` |
| **Pagination tracking** | `useRef(new Set())` for fetched pages |
| **Cache-aside** | Check cache before API call |
| **LocalStorage** | Initialize from localStorage, sync on change |
| **Cross-tab sync** | `window.addEventListener("storage", ...)` |

---

## Tips for Interview

1. **Think out loud** - Explain your approach before coding
2. **Start simple** - Implement basic version first, then optimize
3. **Consider edge cases** - Empty array, single element, duplicates
4. **Discuss time/space complexity** - Always mention Big O
5. **Relate to your experience** - "In my app, I handle this by..."

