# URL Shortener

This is demo application of URL shortener Service like - Bitly

## Functionalities

-   API to get generate short URL from a Long URL
-   Redirection to Long URL from Short URL
-   Analytics API to get view count for a link the last 24hr, 30days and ALL Time.

## Implementations Details

### Assumptions

The implementations and design is based on following assumptions

-   This will is Read heavy system
-   The URL once created is never modified
-   This is backend / MT of the system and UI Server is separate
-   The Short URL should be both unique and short
-   For the same URL, to different Short URL will be generated.
-   **Analytics**: The view count hourly is sufficient to generate last 24 hr, last 30 days and total views
 
## Tech Stack

The system is implemented using NodeJS

`Node.js really shines in building fast, scalable network applications, offers benefits in performance, faster prototyping`

#### Persistance Layer
The Data being stored does not need to have ACID Trancaction and no relations ship is required in the entities, we can go with NoSQL. 

This system is implemented using MongoDB as it is matches our requirement of High Scale and and High Availability. 

-   **Programming Language** : NodeJS, Express, Mongooes (Mongo ORM)
-   **Persistance Layer** : MongoDB, Redis (Used in PROD Environment)
-   **Analytics** : MongoDB is Used for storing time series Data bucketed to hour aggregation.
-   **In Memory Cache**: LRU cache is used for in-memory

## System Components
The System consists of 2 micro services
- Key Generator Service (Cron Job)
- Web Server 

**Why we need different Key Generation Service?**
Reason: To avoid collision One the option was to rely on the fact that the due to large number of Permutations possibles, it is highly likely that there will be no collision of Hashes. But as when System will get filled, it the chances of collision are high.
- Checking the weather a key exists after generating key might cause delay in the API Response. 

- To Overcome this, Key Generator Service keeps generating keys while making sure that Keys are not colliding.
- The Generated Keys are storing as Group of 100 - 1000 in MongoDB Documents
- When NodeJS Server starts, it reads a document and start consuming the keys. 
- Key Generator keeps checking if the the min free keys are less than threshold, then if generate next slot of keys.

Cons:
- One the downside of this approach is this will take up lot memory in MongoDB. This can countered by generating only _N_ extra keys which can be configured based on the traffic. If we are getting 10 million Traffic Monthly, we can generate 10-20 Million extra keys only.


### URL Code length

System is configured to generate random key of [A-Z a-z 0-9] chars of length 6

`Total Possible Combinations with length 6 = 62^6 ~ 56.8 Billions`

If we as assume that we have monthly active users of 100 million, and we generate 10 million short codes in a month, with length 6 we have approx ~ 473 years which will be enough for our usecase.

`56.8 * 10^9 / (10^7 * 12) ~ 473 years`

_Note: The length and characters are configurable through environment variable_

### Storage Capacity estimations

#### **Storing Mapping of Short to Long URL**
Max length of Long URL - 2048 Chars -> 2kB
Each document we can assume = 2KB + 3KB Other Data = 5KB
Each Month we get 10 Million Req = 5KB * 10Million * 12 Month * 5 Years ~ 3TB Data in 5 years

#### **Memory Requirement:**
If we assume that we keep 20% of the URL mapping in Memory, we will be needing
20% of 50GB -> 10GB Memory Capacity (Redis DB)

### Data Model:
**Short URL to Long URL Mapping**

The document to store short URL to Long URL Mapping
```JSON
ShortUrl{
    urlCode: String,
    originalUrl: String,
    createdAt: Date
}
```
Timeseries document collection to stores view count of URL:
```JSON
ShortUrlView {
    urlCode: String, (indexed)
    timeStamp: { type: Date} (indexed)
    count: Number
}
```
- The timeseries data will help in building wide range of queries.
- For reducing number of documents, hourly 
- Storing analytics separate from _ShortUrl_ doc will help in
- **Future Scope**: If we limit the hourly aggregation to last 30 days only, and have seperate bucket for days and months, it will help us to reduce the number of docs per URL
- 30days*24hrs + 12 month = 732 docs will be created per year for each URL


### Performance Optimization:

-   The Assumption of the system are
    -   This will is Read heavy system
    -   The URL once created is never modified

Based on the above assumptions, we can make use of both in-memory and distributed cache like Redis. For in-memory LRU Cache is used. This will give us protection if we are getting very heavy traffic for a viral url.


## Running locally

### Softwares Required

-   Node JS V-12
-   Docker (To Run MongoDB)

### Start MongoDB Locally

```console
docker run --name mongo -p 27017:27017 -v ./data/db -d mongo mongod
```

### Checkout the code and in the root folder of code run following commands

```console
npm install
```

### Start the Code generator corn job. Keep it running. It will generate short codes and store in MongoDB

```console
node codeGeneratorCron.js
```

### Start the web Server

```console
npm start
```

## Testing and APIs

1. API to generate short Code:

```console
curl --location --request POST 'http://localhost:3000/shorturl' \
--header 'Content-Type: application/json' \
--data-raw '{
    "longUrl":"https://www.google.com"
}'
```

-   Sample Response

```json
{
	"message": "success",
	"data": {
		"urlCode": "mfhxr0",
		"shortUrl": "http://localhost:3000/mfhxr0",
		"longUrl": "https://www.google.com"
	}
}
```

2. Copy the short URL and Open in Browser. `(http://localhost:3000/mfhxr0)`

3. Check the Analytics for the short URL

```console
curl --location --request GET 'http://localhost:3000/<short_url_code>/analytics'

curl --location --request GET 'http://localhost:3000/mfhxr0/analytics'
```

-   Sample Response

```JSON
{
    "message": "success",
    "data": {
        "totalCount": 6,
        "last30Days": 6,
        "last24Hr": 5
    }
}
```

## Recommended Architecture For Production
![Architecture](https://i.ibb.co/GQwDsXC/Untitled-Diagram.png)
