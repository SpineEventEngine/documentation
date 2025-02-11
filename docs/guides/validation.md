---
title: Validation User Guide
headline: Documentation
bodyclass: docs
layout: docs
---
# Validation User Guide

<p class="lead">Building a good domain model requires more than just defining data structures. 
One of the commodities required for describing domain specifics is making sure that the data
is correct. This guide will walk you through the API the Validation Library which helps achieving
this goal.</p>

All of the validation features described here are currently supported in the Java environment.
Many are supported in Dart as well. For more info, see the description of individual features
given in the sections below.

## Overview
Spine uses Protobuf for defining data structures of the domain models. The constraints 
that define correctness of data are also defined at this level using custom Protobuf options
[offered](#validation-options) by the Validation Library. 

<p class="note">In order to use validation features, you don't need to understand how custom
options work. Those who are interested in the details of this <em>advanced feature</em> of Protobuf,
please see the [Protobuf Guide](https://developers.google.com/protocol-buffers/docs/proto3#custom_options)
for details.</p>

Here are simple steps in adding validation to the data model:
 1. The programmer adds validation constraints to the Protobuf types of the model.
 2. Spine Model Compiler generates the code which provides validation features.
 3. The programmer calls the validation API of these data types as their instances are created. 

## Java validation API

For Java, we generate additional code to the Protobuf message classes. In particular, the message
builders get one extra method: `vBuild()` — short for "validate and build". It acts just like
`build()` but also throws a `ValidationException` if the message is not valid:

```java
MyMessage.newBuilder()
         .setFoo(invalidValue())
         .vBuild(); // ← Throws ValidationException. 
``` 

If the validation is not required, you may call `build()` or `buildPartial()` provided by Protobuf
Java API.

The message class also gets an extra method — `validate()`. This method does not throw exceptions.
Instead, it returns a list of `ConstraintViolation`s:

```java
MyMessage msg = MyMessage.newBuilder()
                         .setFoo(invalidValue())
                         .buildPartial();
List<ConstraintViolation> violations = msg.validate(); 
```

If the message is valid, the list is empty. If one or more constraints are violated, all
the violations will be present in the list.

## Dart validation API

In Dart, we generate functions for validating messages separately from the message classes. Those
functions can be accessed via the known types:

```dart
var msg = getMessage();
var validate = theKnownTypes.validatorFor(msg);
ValidationError error = validate(msg);
```  

Similarly to `validate()` method in Java, the validation function does not throw exceptions. A list
of `ConstraintViolation`s can be obtained from the `ValidationError`.

## Validation options overview
<a name="validation-options"></a>

In most cases validation constraints are defined for Protobuf message fields such as if a field
must be populated or it must be withing a range, or match a regular expression. Not so often
it may be necessary to require a combination of fields. In this case, validation options are defined
at the level of a corresponding message type. 

## Required fields

When modelling a domain, we often come up to certain data points which cannot be skipped. Those are
represented by required fields of an entity state, a Command, an Event, etc. 

<p class="note">
Protobuf 2 used to have a native support for required fields. 
However, from the serialization perspective, that proved to be
a [design mistake](https://stackoverflow.com/a/31814967/3183076). If a required field was missing,
the message could not be serialized and sent over the wire. Also, it is often too easy to add a new
required field, thereby breaking backwards-compatibility of the message type. In Protobuf 3 all
the fields are optional.</p>

In the Validation Library, we've revived the concept of required fields, but on a different level.
The difference to the Protobuf 2 way is that out required fields do not affect the serialization
of the message.
If a required field is missing, it still can be serialized and passed over the wire. By separating
validation from serialization, we allow users to choose to ignore validation errors and still
transfer messages over the wire when needed.

### How required fields work

Fields in Protobuf may have either a primitive type or a user-defined type. A user-defined type is
a `message` or an `enum` and primitive types are numbers, `string`, and `bytes`. If a `message` or
an `enum` field is not set, the default value is assigned automatically:
  
```java
ZonedDateTime time = getZonedTime();
ZoneId timeZone = time.getZoneId();
assert timeZone.equals(ZoneId.getDefaultInstance());
```

However, due to limitations of the binary format, there is no way to tell if a numeric field is set
to `0` or just not set:

```java
LocalTime time = getTime();
int hours = time.getHours();
assert hours == 0;
```

This means that a numeric field cannot be required, as there is no way to check if it is set. All 
the other fields can be required. For `message` fields this means that the message must not be
empty:

```java
ZonedDateTime time = getZonedTime();
LocalDateTime dateTime = time.getDateTime();
assert !dateTime.equals(LocalDateTime.getDefaultInstance());
```
 
For `enum` fields, this means that the enum value must have a number other than `0` (since 
the enum value with number `0` is the default value of the field):

```java
LocalDate date = getDate();
Month month = date.getMonth();
assert !month.equals(Month.MONTH_UNDEFINED);
```
 
For `string` and `bytes` fields this means that the sequence must not be empty:

```java
PersonName name = getName();
String givenName = name.getGivenName();
assert !givenName.isEmpty();
```

For collection fields (i.e. `repeated` and `map`), a field is considered set if:
  1. The collection is not empty.
  2. At least one of the entries (values for `map`s) matches the rules described above.

Note that collections of numeric fields can be required. In those cases, only the rule 1. applies
and the rule 2. is ignored.

### Declaring required fields

In the basic scenario, a single required field is marked with the `(required)` option:

```proto
import "spine/options.proto";

// A phone number represented by a string of digits.
message PhoneNumber {
    string digits = 1 [(required) = true];
}
```  

Here, the field `PhoneNumber.digits` is required. If the API user tries to validate an instance of
`PhoneNumber` without this field, a `ConstraintViolation` is produced:

```java
PhoneNumber.newBuilder()
           .setDigits("")
           .vBuild(); // ← Throws ValidationException.
```

There are more complex cases for required fields than just a single field. Consider a `oneof` field
group, which always has to be set. Applying `(required)` to the fields does not make sense, since
only one field in the group can be set at a time. Instead, Spine provides `(is_required)` option:

```proto
import "spine/options.proto";
import "spine/net/email_address.proto";
import "acme/auth.proto";

// The means to identify a user.
message UserIdentity {
    oneof auth_type {
        option (is_required) = true;
        
        spine.net.EmailAddress email = 1;
        auth.GoogleId google = 2; 
        auth.TwitterId twitter = 3; 
    }
}
```

In this case one of the fields `UserIdentity.email`, `UserIdentity.google`,
and `UserIdentity.twitter` must be set.

<p class="warning">
`(is_required)` option is not yet supported in Dart.
</p>

In some other cases, a field may be either required or not, depending on the value of another field.
Consider an example of an online store item:

```proto
import "spine/options.proto";
import "spine/core/user_id.proto";
import "google/protobuf/timestamp.proto";

// A product which can be purchased at the online store.
message Item {
    // ...

    google.protobuf.Timestamp when_opened_for_sale = 42;
    spine.core.UserId who_opened_for_sale = 43 [(goes).with = "when_opened_for_sale"];
}
```

The `Item.who_opened_for_sale` field only makes sense for the domain if 
the `Item.when_opened_for_sale` field is set. If `who_opened_for_sale` is set and
`when_opened_for_sale` is not, a constraint violation is produced.

Finally, there are some cases, in which a pair of fields may be set at the same time, but at least
one of them must be set. This and more complex cases are handled by the type-level
`(required_field)` option:

```proto
import "spine/options.proto";

// A name of a person.
message PersonName {
    option (required_field) = "given_name|honorific_prefix & family_name";

    string honorific_prefix = 1;
    string given_name = 2;
    string middle_name = 3;
    string family_name = 4;
    string honorific_suffix = 5;
}
``` 

In case of `PersonName`, either `given_name` or both `honorific_prefix` and `family_name` must be
set. All three can be set at the same time.

### Missing fields

In case if a required field is missing, the validation error message will explicitly say so.
However, if you need a specific error message for this field, you can provide it via
the `(if_missing)` option:

```proto
import "spine/options.proto";

// A phone number represented by a string of digits.
message PhoneNumber {
    string digits = 1 [(required) = true,
                       (if_missing).msg_format = "Phone number must contain digits."];
}
```

Note that this option only applies to fields marked with `(required)` and not to the fields
referenced via any other options.

If `(goes)` option is used, the error message can be customized with the `(goes).msg_format`
parameter. Note that the message should contain two "`%s`" insertion points: first for the name of
the field declaring the option and second for the name of the field targeted by the option.

### When `(required)` is implicit

When defining the domain [Commands]({{site.baseurl}}/docs/introduction/naming-conventions#commandsproto)
or entity states, we have found to be convenient that the first field of the respective Message is the identifier.
Therefore, by convention, Spine treats the first fields of such objects as their IDs:

```proto
import "spine/options.proto";
import "spine/core/user_id.proto";
import "spine/people/person_name.proto";

// The state of the User Aggregate.
message User {
    option (entity).kind = AGGREGATE;

    spine.core.UserId id = 2;
    spine.people.PersonName name = 1;
    // ...
}
```

In this case, the `User.id` field is implicitly `(required) = true`. Note that the field __number__
has nothing to do with this convention, only the field __order__. Thus, `User.name` is not required.

For the next example, consider `user_commands.proto`:

```proto
import "spine/net/url.proto";
import "spine/core/user_id.proto";

// A command to change a user's profile picture.
message ChangeProfilePicture {

    spine.core.UserId id = 1;
    spine.net.Url new_picture = 2;
}
```

In this case, the `ChangeProfilePicture.id` field is the first in the declaration order,
therefore it is implicitly required. By default, the framework will use it in command routing,
as an identifier of the entity handling this command.

This convention does not apply to [Events]({{site.baseurl}}/docs/introduction/naming-conventions#eventsproto).
Unlike Commands, event routing is typically specific to the use case. For example, `UserView` projection
may require a user ID to handle events, whereas the `ProfilePictureGallery` projection might use
a different routing approach, such as grouping by a user group or an email domain associated with a user.

Therefore, all Event fields are not required by default.

## Nested message validation

When a message is validated, only the "shallow" constraints are checked by default. This means that
the message fields can be invalid and the container message is still considered valid.

In order to enable message field checks, use `(validate)` option:

```proto
import "spine/options.proto";
import "spine/people/person_name.proto";

// The state of the User Aggregate.
message User {
    // ...
    
    spine.people.PersonName name = 2 [(validate) = true];
}
```

When an instance of `User` is validated, constraints of `User.name` will also be checked.
If any violations are found, they will be packed into a single violation of the `User` message.

```java
// Honorific prefix not set and `name` is not valid.
PersonName name = PersonName
        .newBuilder()
        .setFamilyName("Smith")
        .build(); // Build without validation.
User user = User
        .newBuilder()
        .setPersonName(name)
        .vBuild(); // ← Throws ValidationException.
```

When applied to a `repeated` or a `map` field, each item (value of a `map`) is validated.

<p class="warning">
`(validate)` option is not yet supported in Dart.
</p>

#### Invalid fields

If a specific error message is required for an invalid field, the `(if_invalid)` option should be
used:

```proto
import "spine/options.proto";
import "spine/people/person_name.proto";

// The state of the User Aggregate.
message User {
    // ...
    
    spine.people.PersonName name = 2 [(validate) = true,
                                      (if_invalid).msg_format = "User name is invalid."];
}
```

## Number bounds

For numeric fields, Spine defines a few options to limit the range of expected values.

### `(min)`/`(max)`

`(min)` and `(max)` are twin options which define the lower and higher bounds for a numeric fields.
The value is specified as a string. Note that the string must be parsable into the field's number
format (e.g. a `int32` field cannot have a `"2.5"` bound).

By default, the bounds are __inclusive__. Use the `exclusive` property to make a bound exclusive. 

Example:

```proto
import "spine/options.proto";

// A distance between two points of a map with a millimeter precision.
message Distance {

    uint64 meters = 1;
    uint32 millimeters = 2 [(max) = { value: "1000" exclusive: true }];
}
```

### Ranges

The `(range)` option is a shortcut for a combination of `(min)` and `(max)`. A range specifies both
boundaries for a numeric field. `(range)` is a `string` option. The `(range)` notation allow
declaring inclusive and exclusive boundaries. A round bracket ("`(`" or "`)`") denotes an exclusive
boundary and a square bracket ("`[`" or "`]`") denotes an inclusive one.

Example:

```proto
import "spine/options.proto";

// A time without a time-zone.
//
// It is a description of a time, not an instant on a time-line.
//
message LocalTime {
    
    int32 hours = 1 [(range) = "[0..23]"];
    int32 minutes = 2 [(range) = "[0 .. 60)"];
    float seconds = 3 [(range) = "[0 .. 60.0)"];
}
```

In the example above, the `LocalTime.hours` field can span between 0 and 23, the `LocalTime.minutes`
field can span between 0 and 59, and the `LocalTime.seconds` field can span between 0.0 and 60.0,
but can never reach 60. Exclusive boundaries are especially powerful for fractional numbers, since,
mathematically, there is no hard upper limit which a field value can reach.

Usage of the double dot separator ("`..`") between the bounds is mandatory.

<p class="note">
In some languages, Protobuf unsigned integers are represented by signed language primitives.
For example, in Java, a `uint64` is represented with a `long`. If a value of a field in Java will
overflow into `long` negatives, it will be considered a negative by the validation library. Keep
that in mind when defining lower bounds.
</p>

## Regular expressions

For `string` fields, the library provides the `(pattern)` option. Users can define a regular
expression to match the field values. Also, some common pattern modifiers are available:
 - `dot_all` (a.k.a. "single line") — enables the dot (`.`) symbol to match all the characters,
   including line breaks;
 - `case_insensitive` — allows to ignore the case of the matched symbols;
 - `multiline` — enables the `^` (caret) and `$` (dollar) signs to match a start and an end of
   a line instead of a start and an end of the whole expression;
 - `unicode` — enables matching the whole UTF-8 sequences;
 - `partial_match` — allows the matched strings to contain a full match to the pattern and some 
   other characters as well. By default, a string only matches a pattern if it is a full match,
   i.e. there are no unaccounted for leading and/or trailing characters.
   
Example:

```proto
import "spine/options.proto";

// A link to an HTTP(S) resource.
message HyperReference {
    string url = 1 [(pattern) = { 
            regex: "https?://.+\\..+" 
            modifier: {
                case_insensitive: true
            }
    }];
}
```

It is recommended to use simple patterns due to performance considerations. For example, fully
fledged URL and email patterns are famously too long to be used in most cases. Treat `(pattern)`
checks as if they were yet another code with regex matching in it.

## Temporal constraints

Spine provides an option for validating time-bearing types. Those are:
 - `google.protobuf.Timestamp`;
 - `spine.time.YearMonth`;
 - `spine.time.LocalDate`;
 - `spine.time.LocalDateTime`;
 - `spine.time.OffsetDateTime`;
 - `spine.time.ZonedDateTime`;
 - any user-defined type which implements the Temporal interface (`io.spine.time.Temporal` for
   Java).

Using the option `(when)`, you may declare that the timestamp should lie in past or in future.

```proto
import "spine/time_options.proto";
import "spine/time/time.proto";

// A command to place an order.
message PlaceOrder {
    
    // ...

    spine.time.ZonedDateTime when_placed = 12 [(when).in = PAST];
    spine.time.ZonedDateTime when_expires = 13 [(when).in = FUTURE];
}
```

Note that the value is checked in relation to the current server time. In most cases, this should
not be an issue. However, be aware that using `FUTURE` in Events and entity states may cause
validation errors when the future comes. Since entity states are validated upon each state change,
and historical events can be replayed, avoid declaring parts of those domain objects to be in
future. Commands, on the other hand, are not replayed or stored automatically. Thus, It is safe
to use `FUTURE` in Commands.

## Distinct collections

Often, a `repeated` field logically represents a set rather than a list. Protobuf does not have
a native support for sets. Moreover, it is often an invalid operation to add a duplicate element to
a set. For such cases, Spine provides the `(distinct)` option, which constrains a `repeated` or
a `map` field to only contain non-duplicating elements (values in case of `map`s).

Example:

```proto
import "spine/options.proto";
import "spine/net/email_address.proto";

// The state of the User Aggregate.
message User {
    // ...

    repeated spine.net.EmailAddress recovery_email = 42 [(distinct) = true];
}
```

## Non-mutable fields

Some messages persist in your system through a stretch of time. The value represented by such
a message may change. However, some fields must not change ever. For checking that, Spine allows
marking fields as `(set_once)`. The option allows changing a value of a field only if the current
value is the default value. Changing a field from a non-default value to anything else will cause
a violation.

In Java, you can validate messages against a `set_once` constraint via
the `Validate.checkValidChange()` method. For example:

```java
MyMessage old = getMessage();
MyMessage changed = doSomeStuff(old);
Validate.checkValidChange(old, changed);
```

`Validate.checkValidChange()` throws a `ValidationException` if the constraint is violated.

<p class="warning">
In Dart, there is no support for this feature.
</p>

Many fields of an entity are immutable. They may be set once in the life of the entity and then
should never be changed. The `(set_once)` constraint is checked automatically for entity states upon
each change.

Example:

```proto
import "spine/options.proto";
import "google/protobuf/timestamp.proto";

// The state of the Order Aggregate.
message Order {
    option (entity).kind = AGGREGATE;

    // ...
    
    google.protobuf.Timestamp when_deleted = 314 [(set_once) = true];
}
```

Once the `Order.when_deleted` field is filled, it can never change.

## External constraints

Sometimes, you need to impose extra validation rules on types you do not control. Consider
the example of an image URL which should always have the `ftp` protocol. In Spine, a `Url` is a tiny
type for representing URL strings:

```proto
package spine.net;

// ...

// A Universal Resource Locator.
//
message Url {

    // The value of the URL.
    string spec = 3 [(required) = true];

    reserved 1, 2;
}
```

Now, we will use this type in our domain definition:

```proto
import "spine/net/url.proto";

// The state of the User Aggregate.
message User {
    // ...

    spine.net.Url profile_picture = 42;
}
```

How do we add validation to the `Url` so that only the `User.profile_picture` is
affected? Just for this purpose, Spine provides the mechanism of external constraints — validation
constraints defined outside the message.

To declare an external constraint, use the `(constraint_for)` option:

```proto
import "spine/options.proto";

// The external constraint definition for `User.profile_picture`.
message UserPictureConstraint {
    option (constraint_for) = "org.example.user.User.profile_picture";

    string spec = 3 [
            (required) = true,
            (pattern).regex = "ftp://.+",
            (pattern).msg_format = "Profile picture should be available via FTP (regex: %s)."
    ];
}
```

The definition of `User` itself need not change.

Note that the fields of an external constraint declaration should replicate the fields of the target
type. In our example, the `Url` type. If the `Url` type had many fields, only those which need any
validation should be declared. However, note that if the `Url` type declares any validation on its
own, all of it is discarded and only the "substitute" rules from the `UserPictureConstraint` are
used.

<p class="warning">
External constraints are not yet supported in Dart.
</p>

<p class="note">
Mind performance considerations when declaring external constraints. It is expected that the number
of such constrains in the whole project is not large, significantly smaller than the number of
normal constraints. This mechanism is not designed to override validation rules of an entire library
of Protobuf definitions, merely a small amount of local patches.
</p>
