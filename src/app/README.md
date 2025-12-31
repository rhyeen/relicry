## Routes

All routes are case insensitive. Most are intentionally quite short to support smaller QR codes.

### Entity Views
Each route listed here exposes a particular entity found in the /src/entities folder. Unless stated otherwise, the endpoints are a server-rendered and the `[id]` in the endpoint is the `id` on the entity.

Here are the different caching strategies:
* **LONG**: Meaning, this entity is very likely to never change, so caching for a reasonable maximum is fine.
* **MEDIUM**: Meaning, this entity is probably not going to change and has minimal impact if it does and a cached (stale) version is retrieved.
* **SHORT**: Meaning, this entity might change, but fairly irregularly or that there is greater impact if a stale version is retrieved. Caching is still preferred though as impact is not detrimental.
* **NONE**: Do not cache this entity.

Here are the different access levels:
* **PUBLIC**: Meaning, anyone may access this page.
* **VARIABLE X**: Meaning, this page displays different content for different User.adminRoles (User.ts) of the authenticated user (User.firebaseUid). Where X is the AdminRole (AdminRole.ts) in question. If X+, then any role higher than it is also permissible (AdminRole is in order of highest roles are higher up in the file). If insufficient AdminRole exists, then the public version of the page is shown. X could also be `owner` or `owner+`, which would mean the associated `userId` is considered permissible.
* **RESTRICTED X**: Meaning, this page is forbidden to view unless the given admin role exists on the authenticated user (see "VARIABLE X" for more details).

Unless stated otherwise, entities associated with the route's entity should also be pulled and cached following the same strategy. Here are mappings that should be considered:
* artId(s) or promotedArtId(s) => IllustrationArt.id or WritingArt.id (Art.ts)
* artistId(s) => Artist.id (Artist.ts)
* eventId(s) => Event.id (Event.ts)
* promotedItemId(s) => PromotedItem.id (PromotedItem.ts)
* questId(s) => Quest.id (QuestId.ts)
* apexId(s) => Apex.id (Apex.ts)
* rewardId(s) => Reward.id (Reward.ts)

Unless stated otherwise, do NOT retrieve or cache:
* userId(s) => User.id (User.ts)
* cardPathId(s) => Card.version + Card.id (Card.ts)
* sceneId(s) => Scene.id (Scene.ts)

Any `imageUrl` or `*ImageUrl` should be cached separately—according to best practices for caching images—assuming a LONG caching strategy for the image.

When requesting the entity from Firestore, assume the id is the docId. Note that the format of the id is listed as a comment above the id itself.

#### `[id]/[card_version]`
* **Entity**: VersionedGambitCard or VersionedDeckCard or VersionedFocusCard (Card.ts)
* **Caching Strategy**: LONG
* **Access Level**: PUBLIC

`[card_version]` in the route path is the `version: number` property on `Version` (Card.ts).

#### `/ax/[id]/[apex_version]`
* **Entity**: If access level is met, then the RevealedApex is shown (Apex.ts)l otherwise, the HiddenApex is shown.
* **Caching Strategy**: NONE
* **Access Level**: VARIABLE event+

Note that the retrieved entity is the StoredApex (Apex.ts), which is used to determine return data.

`[apex_version]` in the route path is the `version: number` property on `Apex` (Apex.ts).

#### `/art/[id]`
* **Entity**: IllustrationArt or WritingArt (Art.ts)
* **Caching Strategy**: LONG
* **Access Level**: PUBLIC

#### `/ast/[id]`
* **Entity**: Artist (Artist.ts)
* **Caching Strategy**: MEDIUM
* **Access Level**: PUBLIC

#### `/dk/[id]`
* **Entity**: Deck (Deck.ts)
* **Caching Strategy**: NONE
* **Access Level**: RESTRICTED owner+

#### `/e/[id]`
* **Entity**: Event (Event.ts)
* **Caching Strategy**: MEDIUM
* **Access Level**: PUBLIC

Also pull all EventMap (EventMap.ts) where EventMap.eventId === `[id]`.

#### `/e/[id]/r/[reward_level]`
* **Entity**: Reward (Reward.ts)
* **Caching Strategy**: MEDIUM
* **Access Level**: PUBLIC

`[reward_level]` in the route path is the `level: number` property on `Reward` (Reward.ts).

#### `/hrd/[id]`
* **Entity**: Herald (Herald.ts)
* **Caching Strategy**: MEDIUM
* **Access Level**: PUBLIC

#### `/map/[id]`
* **Entity**: EventMap (EventMap.ts)
* **Caching Strategy**: MEDIUM
* **Access Level**: PUBLIC

Also pull the Event (Event.ts) where Event.id === `Event[id].eventId`.

#### `/pi/[id]`
* **Entity**: PromotedItem (PromotedItem.ts)
* **Caching Strategy**: MEDIUM
* **Access Level**: PUBLIC

#### `/q/[id]`
* **Entity**: Quest (Quest.ts) and EventQuest (EventQuest.ts)
* **Caching Strategy**: MEDIUM
* **Access Level**: PUBLIC

When pulling EventQuest, the query should be: WHERE questId === `[id]` AND questClaimed.from < NOW() AND questClaimed.to > NOW(). If an EventQuest is not found, then just return the Quest.

#### `/sc/[id]`
* **Entity**: Scene (Scene.ts)
* **Caching Strategy**: MEDIUM
* **Access Level**: RESTRICTED scene+

#### `teq/[user_id]/[event_id]/[quest_id]`
* **Entity**: TrackEventQuest (TrackEventQuest.ts)
* **Caching Strategy**: NONE
* **Access Level**: RESTRICTED owner+

To retrieve, create the id = `teq/${[user_id]}/${[event_id]}/${[quest_id]}`.

#### `u/[id]`
* **Entity**: User (User.ts)
* **Caching Strategy**: NONE
* **Access Level**: VARIABLE owner+

Public view only returns the User.id, User.displayName, and User.adminRoles.

### Additional Views

These views don't follow the standard entity, caching, or access level rules shown in "Entity Views"

#### `/cards`

Displays a list of scroll-to-load Version Cards (Card.ts), sorted by revealedAt (by default). Filter options are also available:
* Is published (Card.publishedAt !== null)
* Aspect (Card.aspect.includes(param))
* Draw limit (Card.drawLimit =<|>=|= param)
* Type (Card.type === param)
* Rarity (Card.rarity === param)
* ID (Card.id === param)
* Title (ElasticSearch text query on Card.title)
* Tag (Card.tags.includes(param))

#### `/playercards/[userId]`

Displays a list of scroll-to-load PlayerCard (PlayerCard.ts), sorted by updatedAt.
