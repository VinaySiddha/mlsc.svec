export interface Topic {
  id: string;
  title: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  resources: { name: string; url: string }[];
  leetcodeUrl?: string;
  gfgUrl?: string;
  codingNinjasUrl?: string;
  videoUrl?: string; // YouTube video link or embed code
  youtubeId?: string; // Specific YouTube video ID for inline playing
}

export interface Module {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  modules: Module[];
}

export const courses: Course[] = [
  {
    id: "striver-sde",
    title: "Striver's SDE Sheet",
    description: "The complete 180+ problems sheet curated by Take U Forward to crack top product-based companies.",
    icon: "🚀",
    color: "#FBBC04",
    modules: [
      {
        id: "sde-d1",
        title: "Day 1: Arrays",
        topics: [
          {
            id: "sde-t-1",
            title: "Set Matrix Zeroes",
            duration: "30 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/set-matrix-zero/" }],
            leetcodeUrl: "https://leetcode.com/problems/set-matrix-zeroes/",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/set-matrix-zeroes/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/set-matrix-zeroes_3846315",
            videoUrl: "https://www.youtube.com/watch?v=N02MPi04x5E",
            youtubeId: "N02MPi04x5E"
          },
          {
            id: "sde-t-2",
            title: "Pascal's Triangle",
            duration: "25 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/program-to-generate-pascals-triangle/" }],
            leetcodeUrl: "https://leetcode.com/problems/pascals-triangle/",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/pascals-triangle5622/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/pascal-s-triangle_1089580",
            videoUrl: "https://www.youtube.com/watch?v=6GHseMTIbw4",
            youtubeId: "6GHseMTIbw4"
          },
          {
            id: "sde-t-3",
            title: "Next Permutation",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/next_permutation-find-next-lexicographically-greater-permutation/" }],
            leetcodeUrl: "https://leetcode.com/problems/next-permutation/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/next-permutation_893046",
            videoUrl: "https://www.youtube.com/watch?v=JDOK8ITYI2o",
            youtubeId: "JDOK8ITYI2o"
          },
          {
            id: "sde-t-4",
            title: "Kadane's Algorithm (Max Subarray Sum)",
            duration: "30 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/kadanes-algorithm-maximum-subarray-sum-in-an-array/" }],
            leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/maximum-subarray-sum_630526",
            videoUrl: "https://www.youtube.com/watch?v=w_KEocd__JI",
            youtubeId: "w_KEocd__JI"
          },
          {
            id: "sde-t-5",
            title: "Sort an array of 0s, 1s and 2s",
            duration: "30 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/sort-an-array-of-0s-1s-and-2s/" }],
            leetcodeUrl: "https://leetcode.com/problems/sort-colors/",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/sort-an-array-of-0s-1s-and-2s_892915",
            videoUrl: "https://www.youtube.com/watch?v=tp8JiYLr9pw",
            youtubeId: "tp8JiYLr9pw"
          },
          {
            id: "sde-t-6",
            title: "Stock Buy and Sell",
            duration: "20 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/stock-buy-and-sell/" }],
            leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/stock-buy-and-sell2615/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/best-time-to-buy-and-sell-stock_619453",
            videoUrl: "https://www.youtube.com/watch?v=eMSfBgbiFnU",
            youtubeId: "eMSfBgbiFnU"
          }
        ]
      },
      {
        id: "sde-d2",
        title: "Day 2: Arrays Part-II",
        topics: [
          {
            id: "sde-t-7",
            title: "Rotate Matrix by 90 Degrees",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/rotate-image-by-90-degrees/" }],
            leetcodeUrl: "https://leetcode.com/problems/rotate-image/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/rotate-matrix_981260",
            videoUrl: "https://www.youtube.com/watch?v=Y72QeX0Efxw",
            youtubeId: "Y72QeX0Efxw"
          },
          {
            id: "sde-t-8",
            title: "Merge Overlapping Subintervals",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/merge-overlapping-sub-intervals/" }],
            leetcodeUrl: "https://leetcode.com/problems/merge-intervals/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/merge-intervals_699917",
            videoUrl: "https://www.youtube.com/watch?v=2JzRBPFYbKE",
            youtubeId: "2JzRBPFYbKE"
          },
          {
            id: "sde-t-9",
            title: "Merge two sorted Arrays without extra space",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/merge-two-sorted-arrays-without-extra-space/" }],
            leetcodeUrl: "https://leetcode.com/problems/merge-sorted-array/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/merge-two-sorted-arrays-without-extra-space_902195",
            videoUrl: "https://www.youtube.com/watch?v=hVl2b3bLzBw",
            youtubeId: "hVl2b3bLzBw"
          },
          {
            id: "sde-t-10",
            title: "Find the duplicate in an array of N+1 integers",
            duration: "30 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/find-the-duplicate-in-an-array-of-n1-integers/" }],
            leetcodeUrl: "https://leetcode.com/problems/find-the-duplicate-number/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/find-duplicate-in-array_1112602",
            videoUrl: "https://www.youtube.com/watch?v=32Ll35mhWg0",
            youtubeId: "32Ll35mhWg0"
          },
          {
            id: "sde-t-11",
            title: "Repeat and Missing Number",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/find-the-repeating-and-missing-numbers/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/find-character-case_5852",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/find-missing-and-repeating2512/1",
            videoUrl: "https://www.youtube.com/watch?v=5nMGy4VU5FM",
            youtubeId: "5nMGy4VU5FM"
          },
          {
            id: "sde-t-12",
            title: "Inversion of Array (Pre-req: Merge Sort)",
            duration: "50 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/count-inversions-in-an-array/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/count-inversions_615",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/inversion-of-array-1587115620/1",
            videoUrl: "https://www.youtube.com/watch?v=kQ1mJlwW-c0",
            youtubeId: "kQ1mJlwW-c0"
          }
        ]
      },
      {
        id: "sde-d3",
        title: "Day 3: Arrays Part-III",
        topics: [
          {
            id: "sde-t-13",
            title: "Search in a 2D Matrix",
            duration: "30 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/search-in-a-sorted-2d-matrix/" }],
            leetcodeUrl: "https://leetcode.com/problems/search-a-2d-matrix/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/search-in-a-2d-matrix_980531",
            videoUrl: "https://www.youtube.com/watch?v=JXU4LkCl7RY",
            youtubeId: "JXU4LkCl7RY"
          },
          {
            id: "sde-t-14",
            title: "Implement Pow(x, n)",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/implement-powxn-double-x-int-n/" }],
            leetcodeUrl: "https://leetcode.com/problems/powx-n/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/find-power-of-a-number_893007",
            videoUrl: "https://www.youtube.com/watch?v=l0YC3876qxg",
            youtubeId: "l0YC3876qxg"
          },
          {
            id: "sde-t-15",
            title: "Majority Element (>N/2 times)",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/find-the-majority-element-that-occurs-more-than-n-2-times/" }],
            leetcodeUrl: "https://leetcode.com/problems/majority-element/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/majority-element_842495",
            videoUrl: "https://www.youtube.com/watch?v=nP_ns3uSh80",
            youtubeId: "nP_ns3uSh80"
          },
          {
            id: "sde-t-16",
            title: "Majority Element (>N/3 times)",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/majority-elementsn-3-times-find-the-elements-that-appears-more-than-n-3-times-in-an-array/" }],
            leetcodeUrl: "https://leetcode.com/problems/majority-element-ii/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/majority-element-ii_893027",
            videoUrl: "https://www.youtube.com/watch?v=vwZj1tJLt60",
            youtubeId: "vwZj1tJLt60"
          },
          {
            id: "sde-t-17",
            title: "Grid Unique Paths",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/grid-unique-paths/" }],
            leetcodeUrl: "https://leetcode.com/problems/unique-paths/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/total-unique-paths_1081470",
            videoUrl: "https://www.youtube.com/watch?v=t_f0nwwdg5o",
            youtubeId: "t_f0nwwdg5o"
          },
          {
            id: "sde-t-18",
            title: "Reverse Pairs (Leetcode 493)",
            duration: "55 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/count-reverse-pairs/" }],
            leetcodeUrl: "https://leetcode.com/problems/reverse-pairs/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/reverse-pairs_1112652",
            videoUrl: "https://www.youtube.com/watch?v=0e4bZaVY3tc",
            youtubeId: "0e4bZaVY3tc"
          }
        ]
      },
      {
        id: "sde-d4",
        title: "Day 4: Arrays Part-IV",
        topics: [
          {
            id: "sde-t-19",
            title: "2-Sum Problem",
            duration: "20 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/two-sum-check-if-a-pair-with-given-sum-exists-in-array/" }],
            leetcodeUrl: "https://leetcode.com/problems/two-sum/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/reading_684524",
            videoUrl: "https://www.youtube.com/watch?v=UXDSeD9mN-k",
            youtubeId: "UXDSeD9mN-k"
          },
          {
            id: "sde-t-20",
            title: "4-Sum Problem",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/4-sum-find-quadruplets-that-sum-to-a-target-value/" }],
            leetcodeUrl: "https://leetcode.com/problems/4sum/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/4sum_983605",
            videoUrl: "https://www.youtube.com/watch?v=eD95WRlh810",
            youtubeId: "eD95WRlh810"
          },
          {
            id: "sde-t-21",
            title: "Longest Consecutive Sequence",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/longest-consecutive-sequence-in-an-array/" }],
            leetcodeUrl: "https://leetcode.com/problems/longest-consecutive-sequence/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/longest-consecutive-sequence_759408",
            videoUrl: "https://www.youtube.com/watch?v=oO5uLE7EUlM",
            youtubeId: "oO5uLE7EUlM"
          },
          {
            id: "sde-t-22",
            title: "Largest Subarray with 0 sum",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/length-of-the-longest-subarray-with-zero-sum/" }],
            gfgUrl: "https://practice.geeksforgeeks.org/problems/largest-subarray-with-0-sum/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/longest-subset-zero-sum_920321",
            videoUrl: "https://www.youtube.com/watch?v=xmguZ6856co",
            youtubeId: "xmguZ6856co"
          },
          {
            id: "sde-t-23",
            title: "Count number of subarrays with given XOR K",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/count-the-number-of-subarrays-with-given-xor-k/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/subarrays-with-xor-k_6826258",
            videoUrl: "https://www.youtube.com/watch?v=eZrV_FS5f14",
            youtubeId: "eZrV_FS5f14"
          },
          {
            id: "sde-t-24",
            title: "Longest Substring without repeat",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/length-of-longest-substring-without-any-repeating-character/" }],
            leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/longest-substring-without-repeating-characters_759402",
            videoUrl: "https://www.youtube.com/watch?v=qtVh-XEpsJo",
            youtubeId: "qtVh-XEpsJo"
          }
        ]
      },
      {
        id: "sde-d5",
        title: "Day 5: Linked List",
        topics: [
          {
            id: "sde-t-25",
            title: "Reverse a Linked List",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/reverse-a-linked-list/" }],
            leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/reverse-the-linked-list_799897",
            videoUrl: "https://www.youtube.com/watch?v=iRtLEoL-r-Y",
            youtubeId: "iRtLEoL-r-Y"
          },
          {
            id: "sde-t-26",
            title: "Find middle of Linked List",
            duration: "20 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/find-middle-element-in-a-linked-list/" }],
            leetcodeUrl: "https://leetcode.com/problems/middle-of-the-linked-list/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/middle-of-linked-list_973250",
            videoUrl: "https://www.youtube.com/watch?v=A2_UrKp5jSE",
            youtubeId: "A2_UrKp5jSE"
          },
          {
            id: "sde-t-27",
            title: "Merge two sorted Linked Lists",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/merge-two-sorted-linked-lists/" }],
            leetcodeUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/merge-two-sorted-linked-lists_800332",
            videoUrl: "https://www.youtube.com/watch?v=Xb4sra3RYM0",
            youtubeId: "Xb4sra3RYM0"
          },
          {
            id: "sde-t-28",
            title: "Remove N-th node from back of LinkedList",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/remove-n-th-node-from-the-end-of-a-linked-list/" }],
            leetcodeUrl: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/remove-k-th-node-from-list-or-find-nth-node-from-end_1170534",
            videoUrl: "https://www.youtube.com/watch?v=3kMKYQ2wVYU",
            youtubeId: "3kMKYQ2wVYU"
          },
          {
            id: "sde-t-29",
            title: "Add two numbers as LinkedList",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/add-two-numbers-represented-as-linked-lists/" }],
            leetcodeUrl: "https://leetcode.com/problems/add-two-numbers/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/add-two-numbers-as-linked-lists_1170520",
            videoUrl: "https://www.youtube.com/watch?v=LBVsXSMOIk4",
            youtubeId: "LBVsXSMOIk4"
          },
          {
            id: "sde-t-30",
            title: "Delete a given Node in O(1)",
            duration: "15 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/delete-given-node-in-a-linked-list-o1-approach/" }],
            leetcodeUrl: "https://leetcode.com/problems/delete-node-in-a-linked-list/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/delete-node-in-a-linked-list_1105578",
            videoUrl: "https://www.youtube.com/watch?v=umKDRhuLLnY",
            youtubeId: "umKDRhuLLnY"
          }
        ]
      },
      {
        id: "sde-d6",
        title: "Day 6: Linked List Part-II",
        topics: [
          {
            id: "sde-t-31",
            title: "Find intersection point of Y LinkedList",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/intersection-of-two-linked-lists/" }],
            leetcodeUrl: "https://leetcode.com/problems/intersection-of-two-linked-lists/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/intersection-of-linked-list_630457",
            videoUrl: "https://www.youtube.com/watch?v=u4FWXscM8LY",
            youtubeId: "u4FWXscM8LY"
          },
          {
            id: "sde-t-32",
            title: "Detect a cycle in Linked List",
            duration: "25 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/detect-a-loop-in-linked-list/" }],
            leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/cycle-detection-in-a-singly-linked-list_628974",
            videoUrl: "https://www.youtube.com/watch?v=355XJ6jyq84",
            youtubeId: "355XJ6jyq84"
          },
          {
            id: "sde-t-33",
            title: "Reverse a LinkedList in groups of size k",
            duration: "50 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/reverse-linked-list-in-groups-of-size-k/" }],
            leetcodeUrl: "https://leetcode.com/problems/reverse-nodes-in-k-group/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/reverse-list-in-k-groups_983644",
            videoUrl: "https://www.youtube.com/watch?v=Of0HPkk3JgI",
            youtubeId: "Of0HPkk3JgI"
          },
          {
            id: "sde-t-34",
            title: "Check if a LinkedList is palindrome or not",
            duration: "35 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/check-if-given-linked-list-is-plaindrome/" }],
            leetcodeUrl: "https://leetcode.com/problems/palindrome-linked-list/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/palindrom-linked-list_799352",
            videoUrl: "https://www.youtube.com/watch?v=lRY_G-u_8jk",
            youtubeId: "lRY_G-u_8jk"
          },
          {
            id: "sde-t-35",
            title: "Find the starting point of the loop of LinkedList",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/starting-point-of-loop-in-linked-list/" }],
            leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle-ii/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/detect-the-first-node-of-the-loop_1112628",
            videoUrl: "https://www.youtube.com/watch?v=2KdY9tvyphc",
            youtubeId: "2KdY9tvyphc"
          },
          {
            id: "sde-t-36",
            title: "Flattening of a LinkedList",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/flattening-a-linked-list/" }],
            gfgUrl: "https://practice.geeksforgeeks.org/problems/flattening-a-linked-list/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/flatten-a-linked-list_1112685",
            videoUrl: "https://www.youtube.com/watch?v=ykvyLk5L1LI",
            youtubeId: "ykvyLk5L1LI"
          }
        ]
      },
      {
        id: "sde-d7",
        title: "Day 7: Linked List and Arrays",
        topics: [
          {
            id: "sde-t-37",
            title: "Rotate a Linked List",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/rotate-a-linked-list/" }],
            leetcodeUrl: "https://leetcode.com/problems/rotate-list/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/rotate-linked-list_920454",
            videoUrl: "https://www.youtube.com/watch?v=9VPm6nEbVPA",
            youtubeId: "9VPm6nEbVPA"
          },
          {
            id: "sde-t-38",
            title: "Clone a Linked List with random and next pointer",
            duration: "50 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/clone-linked-list-with-random-and-next-pointer/" }],
            leetcodeUrl: "https://leetcode.com/problems/copy-list-with-random-pointer/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/clone-linked-list-with-random-pointer_873376",
            videoUrl: "https://www.youtube.com/watch?v=q570bKdrnlw",
            youtubeId: "q570bKdrnlw"
          },
          {
            id: "sde-t-39",
            title: "3 Sum problem",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/3-sum-find-triplets-that-sum-to-zero/" }],
            leetcodeUrl: "https://leetcode.com/problems/3sum/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/triplets-with-given-sum_893028",
            videoUrl: "https://www.youtube.com/watch?v=DhFh8Kw7ymk",
            youtubeId: "DhFh8Kw7ymk"
          },
          {
            id: "sde-t-40",
            title: "Trapping Rainwater",
            duration: "45 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/trapping-rainwater/" }],
            leetcodeUrl: "https://leetcode.com/problems/trapping-rain-water/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/trapping-rainwater_630519",
            videoUrl: "https://www.youtube.com/watch?v=m18Hntz4go8",
            youtubeId: "m18Hntz4go8"
          },
          {
            id: "sde-t-41",
            title: "Remove Duplicate from Sorted array",
            duration: "20 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/remove-duplicates-in-place-from-sorted-array/" }],
            leetcodeUrl: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/remove-duplicates-from-sorted-array_1102307",
            videoUrl: "https://www.youtube.com/watch?v=Fm_p3RZJMcU",
            youtubeId: "Fm_p3RZJMcU"
          },
          {
            id: "sde-t-42",
            title: "Max consecutive ones",
            duration: "15 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/maximum-consecutive-ones/" }],
            leetcodeUrl: "https://leetcode.com/problems/max-consecutive-ones/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/maximum-consecutive-ones_3842991",
            videoUrl: "https://www.youtube.com/watch?v=bYFhGZYJON0",
            youtubeId: "bYFhGZYJON0"
          }
        ]
      },
      {
        id: "sde-d8",
        title: "Day 8: Greedy Algorithm",
        topics: [
          {
            id: "sde-t-43",
            title: "N meetings in one room",
            duration: "35 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/n-meetings-in-one-room/" }],
            gfgUrl: "https://practice.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/maximum-meetings_1062658",
            videoUrl: "https://www.youtube.com/watch?v=II6ziNqv1j4",
            youtubeId: "II6ziNqv1j4"
          },
          {
            id: "sde-t-44",
            title: "Minimum number of platforms required",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/minimum-number-of-platforms-required-for-a-railway/" }],
            gfgUrl: "https://practice.geeksforgeeks.org/problems/minimum-platforms-1587115620/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/minimum-number-of-platforms_799400",
            videoUrl: "https://www.youtube.com/watch?v=dxVcMDI7vyI",
            youtubeId: "dxVcMDI7vyI"
          },
          {
            id: "sde-t-45",
            title: "Job sequencing Problem",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/job-sequencing-problem/" }],
            gfgUrl: "https://practice.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/job-sequencing_799653",
            videoUrl: "https://www.youtube.com/watch?v=LjPx4wQaRIs",
            youtubeId: "LjPx4wQaRIs"
          },
          {
            id: "sde-t-46",
            title: "Fractional Knapsack Problem",
            duration: "30 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/fractional-knapsack-problem-greedy-approach/" }],
            gfgUrl: "https://practice.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/fractional-knapsack_982767",
            videoUrl: "https://www.youtube.com/watch?v=1bI1o76yUPc",
            youtubeId: "1bI1o76yUPc"
          },
          {
            id: "sde-t-47",
            title: "Find minimum number of coins",
            duration: "20 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/find-minimum-number-of-coins/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/find-minimum-number-of-coins_975277",
            videoUrl: "https://www.youtube.com/watch?v=mVg9CfJvayM",
            youtubeId: "mVg9CfJvayM"
          },
          {
            id: "sde-t-48",
            title: "Assign Cookies",
            duration: "20 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/greedy-algorithms/assign-cookies" }],
            leetcodeUrl: "https://leetcode.com/problems/assign-cookies/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/assign-cookies_8390826",
            videoUrl: "https://www.youtube.com/watch?v=DIX2p7vbJEs",
            youtubeId: "DIX2p7vbJEs"
          }
        ]
      },
      {
        id: "sde-d9",
        title: "Day 9: Recursion",
        topics: [
          {
            id: "sde-t-49",
            title: "Subset Sums",
            duration: "30 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/subset-sum-sum-of-all-subsets/" }],
            gfgUrl: "https://practice.geeksforgeeks.org/problems/subset-sums2234/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/subset-sum_3843086",
            videoUrl: "https://www.youtube.com/watch?v=rYkfBRtMJr8",
            youtubeId: "rYkfBRtMJr8"
          },
          {
            id: "sde-t-50",
            title: "Subsets II (Unique Subsets)",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/subset-ii-print-all-unique-subsets/" }],
            leetcodeUrl: "https://leetcode.com/problems/subsets-ii/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/subsets-ii_3843085",
            videoUrl: "https://www.youtube.com/watch?v=RIn3gOkbhQE",
            youtubeId: "RIn3gOkbhQE"
          },
          {
            id: "sde-t-51",
            title: "Combination Sum I",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/combination-sum-1/" }],
            leetcodeUrl: "https://leetcode.com/problems/combination-sum/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/combination-sum_981296",
            videoUrl: "https://www.youtube.com/watch?v=OyZHNrF2gW8",
            youtubeId: "OyZHNrF2gW8"
          },
          {
            id: "sde-t-52",
            title: "Combination Sum II",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/combination-sum-ii-find-all-unique-combinations/" }],
            leetcodeUrl: "https://leetcode.com/problems/combination-sum-ii/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/combination-sum-ii_1112622",
            videoUrl: "https://www.youtube.com/watch?v=G1fTXRxvo0Y",
            youtubeId: "G1fTXRxvo0Y"
          },
          {
            id: "sde-t-53",
            title: "Palindrome Partitioning",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/palindrome-partitioning/" }],
            leetcodeUrl: "https://leetcode.com/problems/palindrome-partitioning/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/palindrome-partitioning_626122",
            videoUrl: "https://www.youtube.com/watch?v=WBgsABoClE0",
            youtubeId: "WBgsABoClE0"
          },
          {
            id: "sde-t-54",
            title: "K-th permutation Sequence",
            duration: "50 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/find-k-th-permutation-sequence/" }],
            leetcodeUrl: "https://leetcode.com/problems/permutation-sequence/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/k-th-permutation-sequence_1112626",
            videoUrl: "https://www.youtube.com/watch?v=wT7gcX55NSk",
            youtubeId: "wT7gcX55NSk"
          }
        ]
      },
      {
        id: "sde-d10",
        title: "Day 10: Recursion and Backtracking",
        topics: [
          {
            id: "sde-t-55",
            title: "Print all Permutations",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/print-all-permutations-of-a-string-array/" }],
            leetcodeUrl: "https://leetcode.com/problems/permutations/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/print-permutations_759263",
            videoUrl: "https://www.youtube.com/watch?v=f2ic2RSC9pU",
            youtubeId: "f2ic2RSC9pU"
          },
          {
            id: "sde-t-56",
            title: "N-Queens Problem",
            duration: "60 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/n-queen-problem-backtracking/" }],
            leetcodeUrl: "https://leetcode.com/problems/n-queens/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/n-queens_759332",
            videoUrl: "https://www.youtube.com/watch?v=i05Ju7AFTcM",
            youtubeId: "i05Ju7AFTcM"
          },
          {
            id: "sde-t-57",
            title: "Sudoku Solver",
            duration: "60 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/sudoku-solver/" }],
            leetcodeUrl: "https://leetcode.com/problems/sudoku-solver/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/sudoku-solver_981286",
            videoUrl: "https://www.youtube.com/watch?v=FWAIf_EVUKE",
            youtubeId: "FWAIf_EVUKE"
          },
          {
            id: "sde-t-58",
            title: "M-Coloring Problem",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/m-coloring-problem/" }],
            gfgUrl: "https://practice.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/m-coloring-problem_981273",
            videoUrl: "https://www.youtube.com/watch?v=wuVwUKA5WYE",
            youtubeId: "wuVwUKA5WYE"
          },
          {
            id: "sde-t-59",
            title: "Rat in a Maze",
            duration: "50 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/rat-in-a-maze/" }],
            gfgUrl: "https://practice.geeksforgeeks.org/problems/rat-in-a-maze-problem/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/rat-in-a-maze_1215030",
            videoUrl: "https://www.youtube.com/watch?v=bLGZHJOMYv0",
            youtubeId: "bLGZHJOMYv0"
          },
          {
            id: "sde-t-60",
            title: "Word Break II (print all ways)",
            duration: "55 mins",
            difficulty: "Hard",
            resources: [{ name: "Problem Link", url: "https://leetcode.com/problems/word-break-ii/" }],
            leetcodeUrl: "https://leetcode.com/problems/word-break-ii/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/word-break-ii_983635",
            videoUrl: "https://www.youtube.com/watch?v=LmHWIsOf9M4",
            youtubeId: "LmHWIsOf9M4"
          }
        ]
      },
      {
        id: "sde-d11",
        title: "Day 11: Binary Search",
        topics: [
          {
            id: "sde-t-61",
            title: "The N-th root of an integer",
            duration: "35 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/nth-root-of-a-number-using-binary-search/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/nth-root-of-m_1164405",
            videoUrl: "https://www.youtube.com/watch?v=rjEJeYCasHs",
            youtubeId: "rjEJeYCasHs"
          },
          {
            id: "sde-t-62",
            title: "Matrix Median",
            duration: "50 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/binary-search/median-of-a-row-wise-sorted-matrix/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/matrix-median_2825313",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/median-in-a-row-wise-sorted-matrix1527/1",
            videoUrl: "https://www.youtube.com/watch?v=63fP834XS98",
            youtubeId: "63fP834XS98"
          },
          {
            id: "sde-t-63",
            title: "Single Element in a Sorted Array",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/search-single-element-in-a-sorted-array/" }],
            leetcodeUrl: "https://leetcode.com/problems/single-element-in-a-sorted-array/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/unique-element-in-sorted-array_1112654",
            videoUrl: "https://www.youtube.com/watch?v=AZOmHuLHxs4",
            youtubeId: "AZOmHuLHxs4"
          },
          {
            id: "sde-t-64",
            title: "Search in Rotated Sorted Array",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/search-element-in-a-rotated-sorted-array/" }],
            leetcodeUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/search-in-rotated-sorted-array_1082554",
            videoUrl: "https://www.youtube.com/watch?v=5zWKALODGsk",
            youtubeId: "5zWKALODGsk"
          },
          {
            id: "sde-t-65",
            title: "Median of 2 Sorted Arrays",
            duration: "60 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/median-of-two-sorted-arrays-of-different-sizes/" }],
            leetcodeUrl: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/median-of-two-sorted-arrays_985294",
            videoUrl: "https://www.youtube.com/watch?v=F9c7LpLD3qo",
            youtubeId: "F9c7LpLD3qo"
          },
          {
            id: "sde-t-66",
            title: "K-th element of two sorted Arrays",
            duration: "50 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/k-th-element-of-two-sorted-arrays/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/k-th-element-of-2-sorted-arrays_1164159",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1",
            videoUrl: "https://www.youtube.com/watch?v=D1oDwWCq50g",
            youtubeId: "D1oDwWCq50g"
          }
        ]
      },
      {
        id: "sde-d12",
        title: "Day 12: Heaps",
        topics: [
          {
            id: "sde-t-67",
            title: "K Max Sum Combinations",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "GFG Article", url: "https://www.geeksforgeeks.org/k-maximum-sum-combinations-two-arrays/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/k-max-sum-combinations_1214980",
            videoUrl: "https://www.youtube.com/watch?v=btQfDqhka_E",
            youtubeId: "btQfDqhka_E"
          },
          {
            id: "sde-t-68",
            title: "Find Median from Data Stream",
            duration: "50 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/find-median-from-data-stream/" }],
            leetcodeUrl: "https://leetcode.com/problems/find-median-from-data-stream/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/median-in-a-stream_975268",
            videoUrl: "https://www.youtube.com/watch?v=RrxpTWgJ9Ek",
            youtubeId: "RrxpTWgJ9Ek"
          },
          {
            id: "sde-t-69",
            title: "Merge K Sorted Arrays",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/merge-k-sorted-arrays/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/merge-k-sorted-arrays_975376",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/merge-k-sorted-arrays/1",
            videoUrl: "https://www.youtube.com/watch?v=l8cuEJIc4E8",
            youtubeId: "l8cuEJIc4E8"
          },
          {
            id: "sde-t-70",
            title: "K-th largest element in an unsorted array",
            duration: "30 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/kth-largest-smallest-element-in-an-array/" }],
            leetcodeUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/kth-largest-element_796007",
            videoUrl: "https://www.youtube.com/watch?v=aXJ1ybzqCP0",
            youtubeId: "aXJ1ybzqCP0"
          },
          {
            id: "sde-t-71",
            title: "Top K Frequent Elements",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "Problem Link", url: "https://leetcode.com/problems/top-k-frequent-elements/" }],
            leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/k-most-frequent-elements_3167353",
            videoUrl: "https://www.youtube.com/watch?v=YPTqKIgVk-k",
            youtubeId: "YPTqKIgVk-k"
          },
          {
            id: "sde-t-72",
            title: "Min Heap Implementation (Priority Queue)",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "GFG Article", url: "https://www.geeksforgeeks.org/binary-heap/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/min-heap_4691101",
            videoUrl: "https://www.youtube.com/watch?v=yAs3t1xszgo",
            youtubeId: "yAs3t1xszgo"
          }
        ]
      },
      {
        id: "sde-d13",
        title: "Day 13: Stack and Queue",
        topics: [
          {
            id: "sde-t-73",
            title: "Implement Stack using Arrays",
            duration: "25 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/implement-stack-using-array/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/stack-implementation-using-array_3210209",
            videoUrl: "https://www.youtube.com/watch?v=GYptUgnIM_c",
            youtubeId: "GYptUgnIM_c"
          },
          {
            id: "sde-t-74",
            title: "Implement Queue using Arrays",
            duration: "25 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/implement-queue-using-array/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/implement-queue-using-array_8390825",
            videoUrl: "https://www.youtube.com/watch?v=M6GnoUD9Z0U",
            youtubeId: "M6GnoUD9Z0U"
          },
          {
            id: "sde-t-75",
            title: "Implement Stack using Single Queue",
            duration: "35 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/implement-stack-using-single-queue/" }],
            leetcodeUrl: "https://leetcode.com/problems/implement-stack-using-queues/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/stack-using-queue_795152",
            videoUrl: "https://www.youtube.com/watch?v=jDZQKzEtbYc",
            youtubeId: "jDZQKzEtbYc"
          },
          {
            id: "sde-t-76",
            title: "Implement Queue using Stacks",
            duration: "35 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/implement-queue-using-stack/" }],
            leetcodeUrl: "https://leetcode.com/problems/implement-queue-using-stacks/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/queue-using-two-stacks_1170046",
            videoUrl: "https://www.youtube.com/watch?v=3Et9kqzy1qw",
            youtubeId: "3Et9kqzy1qw"
          },
          {
            id: "sde-t-77",
            title: "Check for Balanced Parentheses",
            duration: "25 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/check-for-balanced-parentheses/" }],
            leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/valid-parenthesis_795104",
            videoUrl: "https://www.youtube.com/watch?v=wkDfsKpUsAQ",
            youtubeId: "wkDfsKpUsAQ"
          },
          {
            id: "sde-t-78",
            title: "Next Greater Element",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/next-greater-element-using-stack/" }],
            leetcodeUrl: "https://leetcode.com/problems/next-greater-element-i/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/next-greater-element_6703",
            videoUrl: "https://www.youtube.com/watch?v=Du881K7Jtk8",
            youtubeId: "Du881K7Jtk8"
          }
        ]
      },
      {
        id: "sde-d14",
        title: "Day 14: Stack and Queue Part-II",
        topics: [
          {
            id: "sde-t-79",
            title: "Next Smaller Element",
            duration: "30 mins",
            difficulty: "Medium",
            resources: [{ name: "GFG Article", url: "https://www.geeksforgeeks.org/next-smaller-element/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/next-smaller-element_1112581",
            videoUrl: "https://www.youtube.com/watch?v=nc1AYFyvOR4",
            youtubeId: "nc1AYFyvOR4"
          },
          {
            id: "sde-t-80",
            title: "LRU Cache Implementation",
            duration: "60 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/lru-cache-implementation/" }],
            leetcodeUrl: "https://leetcode.com/problems/lru-cache/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/lru-cache-implementation_4241436",
            videoUrl: "https://www.youtube.com/watch?v=xDEuM5qa0zg",
            youtubeId: "xDEuM5qa0zg"
          },
          {
            id: "sde-t-81",
            title: "LFU Cache Implementation",
            duration: "75 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/lfu-cache-most-asked-interview-problem/" }],
            leetcodeUrl: "https://leetcode.com/problems/lfu-cache/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/lfu-cache_3161878",
            videoUrl: "https://www.youtube.com/watch?v=0PSB9y8ehbk",
            youtubeId: "0PSB9y8ehbk"
          },
          {
            id: "sde-t-82",
            title: "Largest rectangle in a histogram",
            duration: "50 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/area-of-largest-rectangle-in-histogram/" }],
            leetcodeUrl: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/largest-rectangle-in-a-histogram_1058189",
            videoUrl: "https://www.youtube.com/watch?v=X0X6G-e_388",
            youtubeId: "X0X6G-e_388"
          },
          {
            id: "sde-t-83",
            title: "Sliding Window Maximum",
            duration: "45 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/sliding-window-maximum/" }],
            leetcodeUrl: "https://leetcode.com/problems/sliding-window-maximum/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/sliding-window-maximum_980228",
            videoUrl: "https://www.youtube.com/watch?v=NW-84nylyfo",
            youtubeId: "NW-84nylyfo"
          },
          {
            id: "sde-t-84",
            title: "Min Stack Implementation",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/implement-min-stack/" }],
            leetcodeUrl: "https://leetcode.com/problems/min-stack/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/min-stack_3843992",
            videoUrl: "https://www.youtube.com/watch?v=V8m5acrRJYY",
            youtubeId: "V8m5acrRJYY"
          }
        ]
      },
      {
        id: "sde-d15",
        title: "Day 15: String",
        topics: [
          {
            id: "sde-t-85",
            title: "Reverse Words in a String",
            duration: "30 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/reverse-words-in-a-string/" }],
            leetcodeUrl: "https://leetcode.com/problems/reverse-words-in-a-string/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/reverse-words-in-a-string_696444",
            videoUrl: "https://www.youtube.com/watch?v=vhnRAaJZ1j4",
            youtubeId: "vhnRAaJZ1j4"
          },
          {
            id: "sde-t-86",
            title: "Longest Palindrome in a String",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/longest-palindromic-substring/" }],
            leetcodeUrl: "https://leetcode.com/problems/longest-palindromic-substring/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/longest-palindromic-substring_893086",
            videoUrl: "https://www.youtube.com/watch?v=w3UrPn1y9zo",
            youtubeId: "w3UrPn1y9zo"
          },
          {
            id: "sde-t-87",
            title: "Roman to Integer / Integer to Roman",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "Roman to Int Guide", url: "https://leetcode.com/problems/roman-to-integer/" }],
            leetcodeUrl: "https://leetcode.com/problems/roman-to-integer/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/roman-numeral-to-integer_981308",
            videoUrl: "https://www.youtube.com/watch?v=3y5RHgV1w4o",
            youtubeId: "3y5RHgV1w4o"
          },
          {
            id: "sde-t-88",
            title: "Implement ATOI",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "LeetCode Link", url: "https://leetcode.com/problems/string-to-integer-atoi/" }],
            leetcodeUrl: "https://leetcode.com/problems/string-to-integer-atoi/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/atoi_981276",
            videoUrl: "https://www.youtube.com/watch?v=q6fS9qA2f9M",
            youtubeId: "q6fS9qA2f9M"
          },
          {
            id: "sde-t-89",
            title: "Longest Common Prefix",
            duration: "25 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/longest-common-prefix/" }],
            leetcodeUrl: "https://leetcode.com/problems/longest-common-prefix/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/longest-common-prefix_20903",
            videoUrl: "https://www.youtube.com/watch?v=0sWShKIJooE",
            youtubeId: "0sWShKIJooE"
          },
          {
            id: "sde-t-90",
            title: "Rabin Karp (Pattern Matching)",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "GFG Article", url: "https://www.geeksforgeeks.org/rabin-karp-algorithm-for-pattern-searching/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/find-pattern-in-string_1112621",
            videoUrl: "https://www.youtube.com/watch?v=qQ8vS2btsxI",
            youtubeId: "qQ8vS2btsxI"
          }
        ]
      },
      {
        id: "sde-d16",
        title: "Day 16: String Part-II",
        topics: [
          {
            id: "sde-t-91",
            title: "Z-Function Pattern Matching",
            duration: "50 mins",
            difficulty: "Hard",
            resources: [{ name: "GFG Article", url: "https://www.geeksforgeeks.org/z-algorithm-linear-time-pattern-searching-algorithm/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/search-pattern-z-algorithm_1112658",
            videoUrl: "https://www.youtube.com/watch?v=V5-7GzOfADQ",
            youtubeId: "V5-7GzOfADQ"
          },
          {
            id: "sde-t-92",
            title: "KMP Algorithm / LPS Table",
            duration: "50 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/kmp-algorithm-pattern-searching/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/find-pattern-in-string_1112621",
            videoUrl: "https://www.youtube.com/watch?v=qases-9gOPk",
            youtubeId: "qases-9gOPk"
          },
          {
            id: "sde-t-93",
            title: "Minimum characters to add for Palindrome",
            duration: "45 mins",
            difficulty: "Hard",
            resources: [{ name: "GFG Article", url: "https://www.geeksforgeeks.org/minimum-characters-added-front-make-string-palindrome/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/minimum-characters-for-palindrome_893000",
            videoUrl: "https://www.youtube.com/watch?v=IPYtxg0V74w",
            youtubeId: "IPYtxg0V74w"
          },
          {
            id: "sde-t-94",
            title: "Check for Anagrams",
            duration: "20 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/check-if-two-strings-are-anagrams-of-each-other/" }],
            leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/anagram_1050803",
            videoUrl: "https://www.youtube.com/watch?v=yW4lV7N5Bv4",
            youtubeId: "yW4lV7N5Bv4"
          },
          {
            id: "sde-t-95",
            title: "Count and Say",
            duration: "30 mins",
            difficulty: "Medium",
            resources: [{ name: "LeetCode Link", url: "https://leetcode.com/problems/count-and-say/" }],
            leetcodeUrl: "https://leetcode.com/problems/count-and-say/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/write-as-you-speak_1090543",
            videoUrl: "https://www.youtube.com/watch?v=S8D8_zU93lM",
            youtubeId: "S8D8_zU93lM"
          },
          {
            id: "sde-t-96",
            title: "Compare Version Numbers",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "LeetCode Link", url: "https://leetcode.com/problems/compare-version-numbers/" }],
            leetcodeUrl: "https://leetcode.com/problems/compare-version-numbers/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/compare-versions_920451",
            videoUrl: "https://www.youtube.com/watch?v=HM3FRK9H9kU",
            youtubeId: "HM3FRK9H9kU"
          }
        ]
      },
      {
        id: "sde-d17",
        title: "Day 17: Binary Tree",
        topics: [
          {
            id: "sde-t-97",
            title: "Inorder Traversal (Recursive & Iterative)",
            duration: "25 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/inorder-traversal-of-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/inorder-traversal_3839605",
            videoUrl: "https://www.youtube.com/watch?v=Z_NEgOB8LHc",
            youtubeId: "Z_NEgOB8LHc"
          },
          {
            id: "sde-t-98",
            title: "Preorder Traversal (Recursive & Iterative)",
            duration: "25 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/preorder-traversal-of-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/binary-tree-preorder-traversal/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/preorder-traversal_3838888",
            videoUrl: "https://www.youtube.com/watch?v=RlUuClW4b5U",
            youtubeId: "RlUuClW4b5U"
          },
          {
            id: "sde-t-99",
            title: "Postorder Traversal (Recursive & Iterative)",
            duration: "25 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/post-order-traversal-of-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/binary-tree-postorder-traversal/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/postorder-traversal_3839614",
            videoUrl: "https://www.youtube.com/watch?v=COQOyFJhC5c",
            youtubeId: "COQOyFJhC5c"
          },
          {
            id: "sde-t-100",
            title: "LeftView & RightView of Binary Tree",
            duration: "35 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/right-left-view-of-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/binary-tree-right-side-view/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/left-view-of-a-binary-tree_920519",
            videoUrl: "https://www.youtube.com/watch?v=KV4mRzT37dE",
            youtubeId: "KV4mRzT37dE"
          },
          {
            id: "sde-t-101",
            title: "Bottom View of Binary Tree",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/bottom-view-of-binary-tree/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/bottom-view-of-binary-tree_893110",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1",
            videoUrl: "https://www.youtube.com/watch?v=0FtVYJA00SA",
            youtubeId: "0FtVYJA00SA"
          },
          {
            id: "sde-t-102",
            title: "Top View of Binary Tree",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/top-view-of-binary-tree/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/top-view-of-binary-tree_799401",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/top-view-of-binary-tree/1",
            videoUrl: "https://www.youtube.com/watch?v=Et9OCDNvJyU",
            youtubeId: "Et9OCDNvJyU"
          }
        ]
      },
      {
        id: "sde-d18",
        title: "Day 18: Binary Tree Part-II",
        topics: [
          {
            id: "sde-t-103",
            title: "Level Order Traversal / Spiral",
            duration: "35 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/level-order-traversal-of-a-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/level-order-traversal_796002",
            videoUrl: "https://www.youtube.com/watch?v=EoAsWbO7sqg",
            youtubeId: "EoAsWbO7sqg"
          },
          {
            id: "sde-t-104",
            title: "Height of a Binary Tree (Depth)",
            duration: "20 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/calculate-maximum-depth-height-of-a-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/height-of-binary-tree_975378",
            videoUrl: "https://www.youtube.com/watch?v=eD3tmO66aBA",
            youtubeId: "eD3tmO66aBA"
          },
          {
            id: "sde-t-105",
            title: "Diameter of Binary Tree",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/calculate-diameter-of-a-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/diameter-of-binary-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/diameter-of-binary-tree_924015",
            videoUrl: "https://www.youtube.com/watch?v=Rezetez59Nk",
            youtubeId: "Rezetez59Nk"
          },
          {
            id: "sde-t-106",
            title: "Check if Binary Tree is Height-Balanced",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/check-if-the-binary-tree-is-balanced-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/balanced-binary-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/is-height-balanced-binary-tree_975497",
            videoUrl: "https://www.youtube.com/watch?v=Yt50CzJdC7s",
            youtubeId: "Yt50CzJdC7s"
          },
          {
            id: "sde-t-107",
            title: "Lowest Common Ancestor (LCA) in BT",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/lowest-common-ancestor-for-two-given-nodes/" }],
            leetcodeUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/lca-of-binary-tree_920541",
            videoUrl: "https://www.youtube.com/watch?v=_-QHfMDde90",
            youtubeId: "_-QHfMDde90"
          },
          {
            id: "sde-t-108",
            title: "Check if two trees are identical",
            duration: "25 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/check-if-two-trees-are-identical/" }],
            leetcodeUrl: "https://leetcode.com/problems/same-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/identical-trees_799364",
            videoUrl: "https://www.youtube.com/watch?v=BhuvF_-PWS0",
            youtubeId: "BhuvF_-PWS0"
          }
        ]
      },
      {
        id: "sde-d19",
        title: "Day 19: Binary Tree Part-III",
        topics: [
          {
            id: "sde-t-109",
            title: "Maximum Path Sum",
            duration: "45 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/maximum-sum-path-in-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/maximum-path-sum-between-two-leaves_794950",
            videoUrl: "https://www.youtube.com/watch?v=WszxKidWCHc",
            youtubeId: "WszxKidWCHc"
          },
          {
            id: "sde-t-110",
            title: "Construct BT from Inorder and Preorder",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/construct-a-binary-tree-from-inorder-and-preorder-traversal/" }],
            leetcodeUrl: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/construct-binary-tree-from-inorder-and-preorder-traversal_920539",
            videoUrl: "https://www.youtube.com/watch?v=aZNaLrVebKQ",
            youtubeId: "aZNaLrVebKQ"
          },
          {
            id: "sde-t-111",
            title: "Construct BT from Inorder and Postorder",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/construct-binary-tree-from-inorder-and-postorder/" }],
            leetcodeUrl: "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/construct-binary-tree-from-postorder-and-inorder-traversal_920512",
            videoUrl: "https://www.youtube.com/watch?v=LgLCOtTXcec",
            youtubeId: "LgLCOtTXcec"
          },
          {
            id: "sde-t-112",
            title: "Symmetric Binary Tree",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/symmetric-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/symmetric-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/symmetric-tree_981177",
            videoUrl: "https://www.youtube.com/watch?v=nKggNAiV18k",
            youtubeId: "nKggNAiV18k"
          },
          {
            id: "sde-t-113",
            title: "Flatten Binary Tree to LinkedList",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/flatten-binary-tree-to-linked-list/" }],
            leetcodeUrl: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/flatten-binary-tree-to-linked-list_1112615",
            videoUrl: "https://www.youtube.com/watch?v=sWfAPAlGeEs",
            youtubeId: "sWfAPAlGeEs"
          },
          {
            id: "sde-t-114",
            title: "Check if BT is a mirror of itself",
            duration: "25 mins",
            difficulty: "Easy",
            resources: [{ name: "GFG Article", url: "https://www.geeksforgeeks.org/check-if-two-trees-are-mirror-of-each-other/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/mirror-tree_3980509",
            videoUrl: "https://www.youtube.com/watch?v=vdb5VJ4N5lc",
            youtubeId: "vdb5VJ4N5lc"
          }
        ]
      },
      {
        id: "sde-d20",
        title: "Day 20: Binary Search Tree",
        topics: [
          {
            id: "sde-t-115",
            title: "Populate Next Right Pointers of Tree",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "LeetCode Link", url: "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/" }],
            leetcodeUrl: "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/connect-nodes-at-same-level_985347",
            videoUrl: "https://www.youtube.com/watch?v=U4hFQCa1Cq0",
            youtubeId: "U4hFQCa1Cq0"
          },
          {
            id: "sde-t-116",
            title: "Search in a BST",
            duration: "20 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/search-in-a-binary-search-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/search-in-a-binary-search-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/search-in-bst_1402878",
            videoUrl: "https://www.youtube.com/watch?v=KcNt6v1648A",
            youtubeId: "KcNt6v1648A"
          },
          {
            id: "sde-t-117",
            title: "Convert Sorted Array to BST",
            duration: "25 mins",
            difficulty: "Easy",
            resources: [{ name: "LeetCode Link", url: "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/convert-sorted-array-to-bst_1264941",
            videoUrl: "https://www.youtube.com/watch?v=UAsLKuEMhsQ",
            youtubeId: "UAsLKuEMhsQ"
          },
          {
            id: "sde-t-118",
            title: "Construct BST from Preorder Traversal",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/construct-binary-search-tree-from-preorder-traversal/" }],
            leetcodeUrl: "https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/bst-from-preorder_2689307",
            videoUrl: "https://www.youtube.com/watch?v=UmJT3j26t1I",
            youtubeId: "UmJT3j26t1I"
          },
          {
            id: "sde-t-119",
            title: "Check if a BT is BST or not",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/check-if-a-binary-tree-is-bst-or-not/" }],
            leetcodeUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/validate-bst_799483",
            videoUrl: "https://www.youtube.com/watch?v=f-sj7I5oXEI",
            youtubeId: "f-sj7I5oXEI"
          },
          {
            id: "sde-t-120",
            title: "LCA in BST",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/lowest-common-ancestor-of-a-binary-search-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/lca-in-bst_981280",
            videoUrl: "https://www.youtube.com/watch?v=cX_kPV_yS2Y",
            youtubeId: "cX_kPV_yS2Y"
          }
        ]
      },
      {
        id: "sde-d21",
        title: "Day 21: Binary Search Tree Part-II",
        topics: [
          {
            id: "sde-t-121",
            title: "Find K-th smallest element in BST",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/kth-largest-smallest-element-in-binary-search-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/kth-smallest-node-in-bst_920381",
            videoUrl: "https://www.youtube.com/watch?v=9TJYWh0ad44",
            youtubeId: "9TJYWh0ad44"
          },
          {
            id: "sde-t-122",
            title: "Find K-th largest element in BST",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/kth-largest-smallest-element-in-binary-search-tree/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/k-th-largest-number-bst_924054",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/kth-largest-element-in-bst/1",
            videoUrl: "https://www.youtube.com/watch?v=cxPG_yAwev8",
            youtubeId: "cxPG_yAwev8"
          },
          {
            id: "sde-t-123",
            title: "Find a pair with a given sum in BST (2-Sum in BST)",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/two-sum-in-bst/" }],
            leetcodeUrl: "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/two-sum-in-bst_920479",
            videoUrl: "https://www.youtube.com/watch?v=A3Js7nU8964",
            youtubeId: "A3Js7nU8964"
          },
          {
            id: "sde-t-124",
            title: "BST Iterator (next and hasNext)",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/bst-iterator-next-and-hasnext-o1-time-and-oh-memory/" }],
            leetcodeUrl: "https://leetcode.com/problems/binary-search-tree-iterator/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/bst-iterator_1112601",
            videoUrl: "https://www.youtube.com/watch?v=D2jMuvurUPE",
            youtubeId: "D2jMuvurUPE"
          },
          {
            id: "sde-t-125",
            title: "Size of largest BST in Binary Tree",
            duration: "55 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/size-of-largest-bst-in-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/maximum-sum-bst-in-binary-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/largest-size-bst-in-binary-tree_983174",
            videoUrl: "https://www.youtube.com/watch?v=X0o5unAtCeQ",
            youtubeId: "X0o5unAtCeQ"
          },
          {
            id: "sde-t-126",
            title: "Serialize and Deserialize Binary Tree",
            duration: "50 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/serialize-and-deserialize-a-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/serialize-and-deserialize-binary-tree_920328",
            videoUrl: "https://www.youtube.com/watch?v=-YbXySKJsX8",
            youtubeId: "-YbXySKJsX8"
          }
        ]
      },
      {
        id: "sde-d22",
        title: "Day 22: Mixed Questions",
        topics: [
          {
            id: "sde-t-127",
            title: "Binary Tree to Double Linked List",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/convert-a-binary-tree-to-a-double-linked-list/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/bst-to-dll_1278456",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/binary-tree-to-dll/1",
            videoUrl: "https://www.youtube.com/watch?v=WsG1825R3pU",
            youtubeId: "WsG1825R3pU"
          },
          {
            id: "sde-t-128",
            title: "Find median in a stream of running integers",
            duration: "45 mins",
            difficulty: "Hard",
            resources: [{ name: "GFG Guide", url: "https://www.geeksforgeeks.org/median-of-stream-of-running-integers-using-sliding-window/" }],
            leetcodeUrl: "https://leetcode.com/problems/find-median-from-data-stream/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/median-in-a-stream_975268",
            videoUrl: "https://www.youtube.com/watch?v=RrxpTWgJ9Ek",
            youtubeId: "RrxpTWgJ9Ek"
          },
          {
            id: "sde-t-129",
            title: "K-th largest element in a stream",
            duration: "35 mins",
            difficulty: "Easy",
            resources: [{ name: "LeetCode Link", url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/" }],
            leetcodeUrl: "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/kth-largest-element-in-a-stream_1112625",
            videoUrl: "https://www.youtube.com/watch?v=3482sHyp42E",
            youtubeId: "3482sHyp42E"
          },
          {
            id: "sde-t-130",
            title: "Distinct numbers in Window",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "GFG Article", url: "https://www.geeksforgeeks.org/count-distinct-elements-in-every-window-of-size-k/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/count-distinct-elements-in-every-window-of-size-k_920336",
            videoUrl: "https://www.youtube.com/watch?v=j48e8ac7r20",
            youtubeId: "j48e8ac7r20"
          },
          {
            id: "sde-t-131",
            title: "Flood Fill Algorithm",
            duration: "35 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/flood-fill-algorithm/" }],
            leetcodeUrl: "https://leetcode.com/problems/flood-fill/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/flood-fill-algorithm_1089687",
            videoUrl: "https://www.youtube.com/watch?v=C-2_uSRli8o",
            youtubeId: "C-2_uSRli8o"
          },
          {
            id: "sde-t-131b",
            title: "Bipartite Graph (BFS/DFS)",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/bipartite-graph-dfs-g-18/" }],
            leetcodeUrl: "https://leetcode.com/problems/is-graph-bipartite/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/bipartite-graph_920513",
            videoUrl: "https://www.youtube.com/watch?v=-vu34sezkLQ",
            youtubeId: "-vu34sezkLQ"
          }
        ]
      },
      {
        id: "sde-d23",
        title: "Day 23: Graph",
        topics: [
          {
            id: "sde-t-132",
            title: "Clone a Graph",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/clone-a-graph/" }],
            leetcodeUrl: "https://leetcode.com/problems/clone-graph/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/clone-graph_1103286",
            videoUrl: "https://www.youtube.com/watch?v=f2JDzByYTjU",
            youtubeId: "f2JDzByYTjU"
          },
          {
            id: "sde-t-133",
            title: "DFS Traversal of Graph",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/depth-first-search-dfs/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/dfs-traversal_630462",
            videoUrl: "https://www.youtube.com/watch?v=Qzf1a--He58",
            youtubeId: "Qzf1a--He58"
          },
          {
            id: "sde-t-134",
            title: "BFS Traversal of Graph",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/breadth-first-search-bfs/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/bfs-in-graph_973002",
            videoUrl: "https://www.youtube.com/watch?v=-tgVpUgsQ5k",
            youtubeId: "-tgVpUgsQ5k"
          },
          {
            id: "sde-t-135",
            title: "Detect Cycle in Undirected Graph",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/detect-a-cycle-in-an-undirected-graph-using-bfs/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/cycle-detection-in-undirected-graph_1062670",
            videoUrl: "https://www.youtube.com/watch?v=BPlrALf1LDU",
            youtubeId: "BPlrALf1LDU"
          },
          {
            id: "sde-t-136",
            title: "Detect Cycle in Directed Graph",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/detect-cycle-in-a-directed-graph-using-dfs/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/detect-cycle-in-a-directed-graph_1062626",
            videoUrl: "https://www.youtube.com/watch?v=9twcmtQn4DU",
            youtubeId: "9twcmtQn4DU"
          },
          {
            id: "sde-t-137",
            title: "Topological Sort BFS (Kahn's) / DFS",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/kahns-algorithm-topological-sort-using-bfs/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/topological-sort_982937",
            videoUrl: "https://www.youtube.com/watch?v=73snFx8y_xs",
            youtubeId: "73snFx8y_xs"
          }
        ]
      },
      {
        id: "sde-d24",
        title: "Day 24: Graph Part-II",
        topics: [
          {
            id: "sde-t-138",
            title: "Strongly Connected Components (Kosaraju)",
            duration: "55 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/strongly-connected-components-kosarajus-algorithm-g-54/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/strongly-connected-components_1171151",
            videoUrl: "https://www.youtube.com/watch?v=V8qIqJxCioo",
            youtubeId: "V8qIqJxCioo"
          },
          {
            id: "sde-t-139",
            title: "Dijkstra's Algorithm (Shortest Path)",
            duration: "50 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/dijkstras-algorithm-using-priority-queue-g-32/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/dijkstra-s-shortest-path_920469",
            videoUrl: "https://www.youtube.com/watch?v=V6H1qAeB-l4",
            youtubeId: "V6H1qAeB-l4"
          },
          {
            id: "sde-t-140",
            title: "Bellman Ford Algorithm",
            duration: "50 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/bellman-ford-algorithm-g-41/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/bellman-ford_2041977",
            videoUrl: "https://www.youtube.com/watch?v=0vVofahB--c",
            youtubeId: "0vVofahB--c"
          },
          {
            id: "sde-t-141",
            title: "Floyd Warshall Algorithm",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/floyd-warshall-algorithm-g-42/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/floyd-warshall_2041979",
            videoUrl: "https://www.youtube.com/watch?v=YbY8cVwWAvw",
            youtubeId: "YbY8cVwWAvw"
          },
          {
            id: "sde-t-142",
            title: "Minimum Spanning Tree (Prim's Algorithm)",
            duration: "55 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/prims-algorithm-minimum-spanning-tree-c-g-45/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/prim-s-mst_968338",
            videoUrl: "https://www.youtube.com/watch?v=mJcZClgVJGs",
            youtubeId: "mJcZClgVJGs"
          },
          {
            id: "sde-t-142b",
            title: "Minimum Spanning Tree (Kruskal's Algorithm)",
            duration: "55 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/graphs/kruskals-algorithm-minimum-spanning-tree-g-47/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/kruskal-s-minimum-spanning-tree-algorithm_1082553",
            videoUrl: "https://www.youtube.com/watch?v=DMnDM_pHc84",
            youtubeId: "DMnDM_pHc84"
          }
        ]
      },
      {
        id: "sde-d25",
        title: "Day 25: Dynamic Programming",
        topics: [
          {
            id: "sde-t-143",
            title: "Maximum Product Subarray",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/maximum-product-subarray-in-an-array/" }],
            leetcodeUrl: "https://leetcode.com/problems/maximum-product-subarray/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/maximum-product-subarray_1115474",
            videoUrl: "https://www.youtube.com/watch?v=hnasdSjdM_I",
            youtubeId: "hnasdSjdM_I"
          },
          {
            id: "sde-t-144",
            title: "Longest Increasing Subsequence (LIS)",
            duration: "50 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/longest-increasing-subsequence-dp-41/" }],
            leetcodeUrl: "https://leetcode.com/problems/longest-increasing-subsequence/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/longest-increasing-subsequence_630459",
            videoUrl: "https://www.youtube.com/watch?v=ekCwMsifsVc",
            youtubeId: "ekCwMsifsVc"
          },
          {
            id: "sde-t-145",
            title: "Longest Common Subsequence (LCS)",
            duration: "50 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/longest-common-subsequence-dp-25/" }],
            leetcodeUrl: "https://leetcode.com/problems/longest-common-subsequence/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/longest-common-subsequence_624875",
            videoUrl: "https://www.youtube.com/watch?v=NPZn9jBrX8U",
            youtubeId: "NPZn9jBrX8U"
          },
          {
            id: "sde-t-146",
            title: "0-1 Knapsack Problem",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/0-1-knapsack-dp-19/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/0-1-knapsack_920542",
            gfgUrl: "https://practice.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1",
            videoUrl: "https://www.youtube.com/watch?v=GqOmJWY27Ro",
            youtubeId: "GqOmJWY27Ro"
          },
          {
            id: "sde-t-147",
            title: "Edit Distance",
            duration: "50 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/edit-distance-dp-33/" }],
            leetcodeUrl: "https://leetcode.com/problems/edit-distance/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/edit-distance_630420",
            videoUrl: "https://www.youtube.com/watch?v=fJaKO8FbDSI",
            youtubeId: "fJaKO8FbDSI"
          },
          {
            id: "sde-t-148",
            title: "Subset Sum Partition (Equal Subset Sum)",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/partition-equal-subset-sum-dp-15/" }],
            leetcodeUrl: "https://leetcode.com/problems/partition-equal-subset-sum/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/partition-equal-subset-sum_892980",
            videoUrl: "https://www.youtube.com/watch?v=7win3_5_DUU",
            youtubeId: "7win3_5_DUU"
          }
        ]
      },
      {
        id: "sde-d26",
        title: "Day 26: Dynamic Programming Part-II",
        topics: [
          {
            id: "sde-t-149",
            title: "Maximum Sum Path in Matrix (Minimum Path Sum)",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/minimum-path-sum-in-a-grid-dp-10/" }],
            leetcodeUrl: "https://leetcode.com/problems/minimum-path-sum/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/minimum-path-sum_985349",
            videoUrl: "https://www.youtube.com/watch?v=_rgTlyky1uQ",
            youtubeId: "_rgTlyky1uQ"
          },
          {
            id: "sde-t-150",
            title: "Coin Change Problem (Max Ways)",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/coin-change-2-dp-22/" }],
            leetcodeUrl: "https://leetcode.com/problems/coin-change-ii/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/ways-to-make-coin-change_630471",
            videoUrl: "https://www.youtube.com/watch?v=HgyyI1yFC74",
            youtubeId: "HgyyI1yFC74"
          },
          {
            id: "sde-t-151",
            title: "Subset Sum Equal to Target K",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/subset-sum-equal-to-target-dp-14/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/subset-sum-equal-to-k_1550900",
            videoUrl: "https://www.youtube.com/watch?v=fWX9xDmIzRI",
            youtubeId: "fWX9xDmIzRI"
          },
          {
            id: "sde-t-152",
            title: "Rod Cutting Problem",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/rod-cutting-problem-dp-24/" }],
            gfgUrl: "https://practice.geeksforgeeks.org/problems/rod-cutting0840/1",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/rod-cutting-problem_800284",
            videoUrl: "https://www.youtube.com/watch?v=mO8XMYwG688",
            youtubeId: "mO8XMYwG688"
          },
          {
            id: "sde-t-153",
            title: "Egg Dropping Puzzle",
            duration: "60 mins",
            difficulty: "Hard",
            resources: [{ name: "GFG Article", url: "https://www.geeksforgeeks.org/egg-dropping-puzzle-dp-11/" }],
            leetcodeUrl: "https://leetcode.com/problems/super-egg-drop/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/super-egg-drop_1062633",
            videoUrl: "https://www.youtube.com/watch?v=S49zeUje26s",
            youtubeId: "S49zeUje26s"
          },
          {
            id: "sde-t-154",
            title: "Word Break Problem",
            duration: "50 mins",
            difficulty: "Medium",
            resources: [{ name: "LeetCode Link", url: "https://leetcode.com/problems/word-break/" }],
            leetcodeUrl: "https://leetcode.com/problems/word-break/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/word-break-1_2247568",
            videoUrl: "https://www.youtube.com/watch?v=Xt9_yS4T9Ds",
            youtubeId: "Xt9_yS4T9Ds"
          }
        ]
      },
      {
        id: "sde-d27",
        title: "Day 27: Trie",
        topics: [
          {
            id: "sde-t-155",
            title: "Implement Trie (Prefix Tree)",
            duration: "30 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/implement-trie-how-to-implement-trie/" }],
            leetcodeUrl: "https://leetcode.com/problems/implement-trie-prefix-tree/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/implement-trie_630514",
            videoUrl: "https://www.youtube.com/watch?v=dBGUmLIhjaM",
            youtubeId: "dBGUmLIhjaM"
          },
          {
            id: "sde-t-156",
            title: "Implement Trie - II",
            duration: "35 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/implement-trie-ii/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/implement-trie_1387095",
            videoUrl: "https://www.youtube.com/watch?v=K59E175sp1k",
            youtubeId: "K59E175sp1k"
          },
          {
            id: "sde-t-157",
            title: "Complete String (Longest String with Prefixes)",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/longest-word-with-all-prefixes/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/complete-string_2687860",
            videoUrl: "https://www.youtube.com/watch?v=5ateuo3aJ5g",
            youtubeId: "5ateuo3aJ5g"
          },
          {
            id: "sde-t-158",
            title: "Number of Distinct Substrings in a String",
            duration: "40 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/number-of-distinct-substrings-in-a-string-using-trie/" }],
            codingNinjasUrl: "https://www.naukri.com/code360/problems/number-of-distinct-substrings_1110025",
            videoUrl: "https://www.youtube.com/watch?v=RV0QeTyHZxo",
            youtubeId: "RV0QeTyHZxo"
          },
          {
            id: "sde-t-159",
            title: "Power Set (Subsequences of String)",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/power-set-print-all-the-possible-subsequences-of-the-string/" }],
            leetcodeUrl: "https://leetcode.com/problems/subsets/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/power-set_1062635",
            videoUrl: "https://www.youtube.com/watch?v=b7AYbpM5YrE",
            youtubeId: "b7AYbpM5YrE"
          },
          {
            id: "sde-t-160",
            title: "Maximum XOR of two numbers in an array",
            duration: "45 mins",
            difficulty: "Medium",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/data-structure/maximum-xor-of-two-numbers-in-an-array/" }],
            leetcodeUrl: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/maximum-xor_973110",
            videoUrl: "https://www.youtube.com/watch?v=EIhPxFLnF8A",
            youtubeId: "EIhPxFLnF8A"
          },
          {
            id: "sde-t-161",
            title: "Maximum XOR With an Element From Array",
            duration: "50 mins",
            difficulty: "Hard",
            resources: [{ name: "TUF Article", url: "https://takeuforward.org/trie/maximum-xor-with-an-element-from-array-trie/" }],
            leetcodeUrl: "https://leetcode.com/problems/maximum-xor-with-an-element-from-array/",
            codingNinjasUrl: "https://www.naukri.com/code360/problems/max-xor-queries_1382520",
            videoUrl: "https://www.youtube.com/watch?v=Q8LhG9Pi5KM",
            youtubeId: "Q8LhG9Pi5KM"
          }
        ]
      },
      {
        id: "sde-d28",
        title: "Day 28: Operating Systems (OS)",
        topics: [
          {
            id: "sde-t-162",
            title: "Processes, Threads & CPU Scheduling",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "OS Revision Guide", url: "https://takeuforward.org/operating-system/operating-system-interview-questions-most-asked/" }],
            videoUrl: "https://www.youtube.com/watch?v=bkG32S8N3hE",
            youtubeId: "bkG32S8N3hE"
          },
          {
            id: "sde-t-163",
            title: "Deadlocks, Semaphores & Concurrency",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "OS Revision Guide", url: "https://takeuforward.org/operating-system/operating-system-interview-questions-most-asked/" }],
            videoUrl: "https://www.youtube.com/watch?v=rK9V_M4P80o",
            youtubeId: "rK9V_M4P80o"
          },
          {
            id: "sde-t-164",
            title: "Memory Management & Virtual Memory",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "OS Memory Guide", url: "https://takeuforward.org/operating-system/operating-system-interview-questions-most-asked/" }],
            videoUrl: "https://www.youtube.com/watch?v=pD4J2J9f4t0",
            youtubeId: "pD4J2J9f4t0"
          }
        ]
      },
      {
        id: "sde-d29",
        title: "Day 29: Database Management Systems (DBMS)",
        topics: [
          {
            id: "sde-t-165",
            title: "ER Models & Relational Algebra",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "DBMS Prep", url: "https://takeuforward.org/dbms/dbms-interview-questions/" }],
            videoUrl: "https://www.youtube.com/watch?v=kB6YwP3bS30",
            youtubeId: "kB6YwP3bS30"
          },
          {
            id: "sde-t-166",
            title: "SQL Queries, Joins & Indexing",
            duration: "1.5 hrs",
            difficulty: "Medium",
            resources: [{ name: "SQL Query Guide", url: "https://takeuforward.org/dbms/dbms-interview-questions/" }],
            videoUrl: "https://www.youtube.com/watch?v=HXT3mK8iW98",
            youtubeId: "HXT3mK8iW98"
          },
          {
            id: "sde-t-167",
            title: "ACID Properties & Transactions",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "ACID properties", url: "https://takeuforward.org/dbms/dbms-interview-questions/" }],
            videoUrl: "https://www.youtube.com/watch?v=4Z99V2m3C1o",
            youtubeId: "4Z99V2m3C1o"
          }
        ]
      },
      {
        id: "sde-d30",
        title: "Day 30: Computer Networks & Projects",
        topics: [
          {
            id: "sde-t-168",
            title: "OSI Layers, TCP/IP vs UDP",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "CN Prep Guide", url: "https://takeuforward.org/computer-network/computer-network-interview-questions-most-asked/" }],
            videoUrl: "https://www.youtube.com/watch?v=3Qh8x63bU2Q",
            youtubeId: "3Qh8x63bU2Q"
          },
          {
            id: "sde-t-169",
            title: "HTTP/HTTPS, DNS & Security Protocols",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "Security & DNS", url: "https://takeuforward.org/computer-network/computer-network-interview-questions-most-asked/" }],
            videoUrl: "https://www.youtube.com/watch?v=yW4lV7N5Bv4",
            youtubeId: "yW4lV7N5Bv4"
          },
          {
            id: "sde-t-170",
            title: "How to Explain Projects in Interviews",
            duration: "1.5 hrs",
            difficulty: "Easy",
            resources: [{ name: "TUF Project Explanation Guide", url: "https://takeuforward.org/interviews/how-to-explain-projects-in-interviews/" }],
            videoUrl: "https://www.youtube.com/watch?v=3Y8t8y_q7j0",
            youtubeId: "3Y8t8y_q7j0"
          }
        ]
      }
    ]
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    description: "Deep dive into fundamental algorithms, data structures, and spatial/temporal optimizations.",
    icon: "🧠",
    color: "#7C3AED",
    modules: [
      {
        id: "dsa-mod-1",
        title: "Arrays, Hashing & Strings",
        topics: [
          {
            id: "dsa-t-1",
            title: "Two Sum & Hash Map Optimizations",
            duration: "45 mins",
            difficulty: "Easy",
            resources: [{ name: "LeetCode 1 - Two Sum", url: "https://leetcode.com/problems/two-sum/" }],
            leetcodeUrl: "https://leetcode.com/problems/two-sum/",
            videoUrl: "https://www.youtube.com/watch?v=UXDSeD9mN-k",
            youtubeId: "UXDSeD9mN-k"
          },
          {
            id: "dsa-t-2",
            title: "Group Anagrams & Frequency Counting",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "LeetCode 49 - Group Anagrams", url: "https://leetcode.com/problems/group-anagrams/" }],
            leetcodeUrl: "https://leetcode.com/problems/group-anagrams/",
            videoUrl: "https://www.youtube.com/watch?v=vzdNOK2oB2E",
            youtubeId: "vzdNOK2oB2E"
          },
          {
            id: "dsa-t-2b",
            title: "Valid Anagram",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "LeetCode 242", url: "https://leetcode.com/problems/valid-anagram/" }],
            leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
            videoUrl: "https://www.youtube.com/watch?v=yW4lV7N5Bv4",
            youtubeId: "yW4lV7N5Bv4"
          },
          {
            id: "dsa-t-2c",
            title: "Top K Frequent Elements",
            duration: "50 mins",
            difficulty: "Medium",
            resources: [{ name: "LeetCode 347", url: "https://leetcode.com/problems/top-k-frequent-elements/" }],
            leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
            videoUrl: "https://www.youtube.com/watch?v=YPTqKIgVk-k",
            youtubeId: "YPTqKIgVk-k"
          }
        ]
      },
      {
        id: "dsa-mod-2",
        title: "Two Pointers & Sliding Window",
        topics: [
          {
            id: "dsa-t-3",
            title: "Valid Palindrome",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "LeetCode 125", url: "https://leetcode.com/problems/valid-palindrome/" }],
            leetcodeUrl: "https://leetcode.com/problems/valid-palindrome/",
            videoUrl: "https://www.youtube.com/watch?v=j48e8ac7r20",
            youtubeId: "j48e8ac7r20"
          },
          {
            id: "dsa-t-4",
            title: "Container With Most Water",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "LeetCode 11", url: "https://leetcode.com/problems/container-with-most-water/" }],
            leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
            videoUrl: "https://www.youtube.com/watch?v=ZHwDeg046Ec",
            youtubeId: "ZHwDeg046Ec"
          },
          {
            id: "dsa-t-4b",
            title: "Best Time to Buy and Sell Stock",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "LeetCode 121", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" }],
            leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
            videoUrl: "https://www.youtube.com/watch?v=excAOvlF_hI",
            youtubeId: "excAOvlF_hI"
          },
          {
            id: "dsa-t-4c",
            title: "Longest Substring Without Repeating Characters",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "LeetCode 3", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" }],
            leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
            videoUrl: "https://www.youtube.com/watch?v=qtVh-XEpsJo",
            youtubeId: "qtVh-XEpsJo"
          }
        ]
      },
      {
        id: "dsa-mod-3",
        title: "Trees & Graphs",
        topics: [
          {
            id: "dsa-t-5",
            title: "Invert Binary Tree",
            duration: "45 mins",
            difficulty: "Easy",
            resources: [{ name: "LeetCode 226", url: "https://leetcode.com/problems/invert-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/invert-binary-tree/",
            videoUrl: "https://www.youtube.com/watch?v=fKl255z2c10",
            youtubeId: "fKl255z2c10"
          },
          {
            id: "dsa-t-6",
            title: "Number of Islands (BFS/DFS)",
            duration: "1.5 hrs",
            difficulty: "Medium",
            resources: [{ name: "LeetCode 200", url: "https://leetcode.com/problems/number-of-islands/" }],
            leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
            videoUrl: "https://www.youtube.com/watch?v=pV2kpPDTOmc",
            youtubeId: "pV2kpPDTOmc"
          },
          {
            id: "dsa-t-6b",
            title: "Max Depth of Binary Tree",
            duration: "30 mins",
            difficulty: "Easy",
            resources: [{ name: "LeetCode 104", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" }],
            leetcodeUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
            videoUrl: "https://www.youtube.com/watch?v=eD3tmO66aBA",
            youtubeId: "eD3tmO66aBA"
          },
          {
            id: "dsa-t-6c",
            title: "Clone Graph",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "LeetCode 133", url: "https://leetcode.com/problems/clone-graph/" }],
            leetcodeUrl: "https://leetcode.com/problems/clone-graph/",
            videoUrl: "https://www.youtube.com/watch?v=mQeF6bN8h1U",
            youtubeId: "mQeF6bN8h1U"
          }
        ]
      }
    ]
  },
  {
    id: "system-design",
    title: "System Design",
    description: "Learn to design highly scalable, fault-tolerant, and distributed software systems.",
    icon: "⚙️",
    color: "#3b82f6",
    modules: [
      {
        id: "sys-mod-1",
        title: "Scaling Foundations",
        topics: [
          {
            id: "sys-t-1",
            title: "Vertical vs Horizontal Scaling",
            duration: "45 mins",
            difficulty: "Easy",
            resources: [{ name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer#horizontal-vs-vertical-scaling" }],
            videoUrl: "https://www.youtube.com/watch?v=xpDnVSmNFX0",
            youtubeId: "xpDnVSmNFX0"
          },
          {
            id: "sys-t-2",
            title: "Load Balancers (Nginx, HAProxy)",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "ByteByteGo Load Balancer", url: "https://bytebytego.com/" }],
            videoUrl: "https://www.youtube.com/watch?v=i9y_B1S8lXg",
            youtubeId: "i9y_B1S8lXg"
          },
          {
            id: "sys-t-2b",
            title: "DNS & Content Delivery Networks (CDN)",
            duration: "45 mins",
            difficulty: "Easy",
            resources: [{ name: "Cloudflare CDN Guide", url: "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/" }],
            videoUrl: "https://www.youtube.com/watch?v=BQ3H3a0d5Xk",
            youtubeId: "BQ3H3a0d5Xk"
          }
        ]
      },
      {
        id: "sys-mod-2",
        title: "Distributed Components",
        topics: [
          {
            id: "sys-t-3",
            title: "Caching Strategies (Redis & Memcached)",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "Redis Caching Patterns", url: "https://redis.io/topics/data-types-intro" }],
            videoUrl: "https://www.youtube.com/watch?v=U3RkDLtS7uY",
            youtubeId: "U3RkDLtS7uY"
          },
          {
            id: "sys-t-4",
            title: "Message Queues & Event Streaming (Kafka)",
            duration: "1.2 hrs",
            difficulty: "Hard",
            resources: [{ name: "Kafka Intro", url: "https://kafka.apache.org/" }],
            videoUrl: "https://www.youtube.com/watch?v=UNUz1-msbOM",
            youtubeId: "UNUz1-msbOM"
          },
          {
            id: "sys-t-4b",
            title: "Database Sharding & Replication",
            duration: "1 hr",
            difficulty: "Hard",
            resources: [{ name: "DB Sharding Guide", url: "https://gcore.com/learning/database-sharding-explained/" }],
            videoUrl: "https://www.youtube.com/watch?v=5faMjKuB9bc",
            youtubeId: "5faMjKuB9bc"
          }
        ]
      },
      {
        id: "sys-mod-3",
        title: "Real-world Case Studies",
        topics: [
          {
            id: "sys-t-5",
            title: "Designing a URL Shortener (TinyURL)",
            duration: "1.5 hrs",
            difficulty: "Medium",
            resources: [{ name: "TinyURL System Design", url: "https://github.com/donnemartin/system-design-primer" }],
            videoUrl: "https://www.youtube.com/watch?v=fMZMm_oF2-E",
            youtubeId: "fMZMm_oF2-E"
          },
          {
            id: "sys-t-6",
            title: "Designing a Video Streaming Service (Netflix)",
            duration: "2 hrs",
            difficulty: "Hard",
            resources: [{ name: "Netflix Architecture", url: "https://netflixtechblog.com/" }],
            videoUrl: "https://www.youtube.com/watch?v=psQzyFyUGbA",
            youtubeId: "psQzyFyUGbA"
          }
        ]
      }
    ]
  },
  {
    id: "web-dev",
    title: "Web & Full-Stack Development",
    description: "Build production-ready full-stack applications with modern web standards.",
    icon: "🌐",
    color: "#10b981",
    modules: [
      {
        id: "web-mod-1",
        title: "Frontend & React Core",
        topics: [
          {
            id: "web-t-1",
            title: "React Hooks, State & Context API",
            duration: "1 hr",
            difficulty: "Easy",
            resources: [{ name: "React Docs - State", url: "https://react.dev/" }],
            videoUrl: "https://www.youtube.com/watch?v=TNhaISOUy6Q",
            youtubeId: "TNhaISOUy6Q"
          },
          {
            id: "web-t-2",
            title: "State Management with Zustand & Redux",
            duration: "1 hr",
            difficulty: "Medium",
            resources: [{ name: "Zustand Intro", url: "https://zustand-demo.pmnd.rs/" }],
            videoUrl: "https://www.youtube.com/watch?v=pQ2Z2d2k65E",
            youtubeId: "pQ2Z2d2k65E"
          }
        ]
      },
      {
        id: "web-mod-2",
        title: "Next.js & Server Components",
        topics: [
          {
            id: "web-t-3",
            title: "React Server Components (RSC) & Hydration",
            duration: "1.5 hrs",
            difficulty: "Medium",
            resources: [{ name: "Next.js Rendering", url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components" }],
            videoUrl: "https://www.youtube.com/watch?v=TJQn595v5s4",
            youtubeId: "TJQn595v5s4"
          },
          {
            id: "web-t-4",
            title: "Server Actions & Form Handling",
            duration: "1.2 hrs",
            difficulty: "Medium",
            resources: [{ name: "Next.js Server Actions", url: "https://nextjs.org/docs" }],
            videoUrl: "https://www.youtube.com/watch?v=dDpZfOQBMaU",
            youtubeId: "dDpZfOQBMaU"
          }
        ]
      }
    ]
  }
];
