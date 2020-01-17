function descriptionLinkMatching(event, matcher) {
  if (event.description) {
    var hrefRegex = /href\s*=\s*(['"])(https?:\/\/.+?)\1/ig;
    var maybeLinks = event.description.match(hrefRegex);
    if (maybeLinks !== null) {
      var matchingLinks = maybeLinks.map(function(l) {
        return l.replace(/href=/, "").replace(/"/g, "");
      }).filter(function(l) {
        return l.match(matcher);
      });
      if (matchingLinks.length > 0) {
        return matchingLinks[0];
      };
    };
  };
  return "";
};
function formatFbLink(event) {
  return descriptionLinkMatching(event, /www.facebook.com/);
};
function formatLocation(event) {
  var linkOrNull = null;
  var locationName = '<i class="fas fa-street-view"></i>';
  if (event.location) {
    locationName = event.location.split(",")[0];
  };
  var result = '@ ' + locationName;
  var mapsLinkGoogle = descriptionLinkMatching(event, /www.google.com/);
  var mapsLinkGoo = descriptionLinkMatching(event, /goo.gl/);
  if (mapsLinkGoogle.length > 0) {
    result = '@ <a href="' + mapsLinkGoogle + '" target="_blank">' + locationName + '</a>';
  } else if (mapsLinkGoo.length > 0) {
    result = '@ <a href="' + mapsLinkGoo + '" target="_blank">' + locationName + '</a>';
  };
  return '<p>' + result + '</p>';
};
function formatStartEndTime(event) {
  var startsAtMoment = moment(event.start.dateTime);
  var endsAtMoment = moment(event.end.dateTime);
  var startsAt = startsAtMoment.format("MMMM Do YYYY, h:mm a");
  if (startsAtMoment.isSame(endsAtMoment, 'date')) {
    var endsAt = endsAtMoment.format("LT");
  } else {
    var endsAt = endsAtMoment.format("h:mm a MMMM Do");
  }
  if (event.start.date) {
    return '<p>' + startsAtMoment.format("MMMM Do YYYY") + '</p>';
  } else {
    return '<p>' + startsAt + ' - ' + endsAt + '</p>';
  };
};
function formatDate(event) {
  var startsAtMoment = moment(event.start.dateTime);
  return '<div class="col-sm-2 gig-date text-center"><p>' + startsAtMoment.format("MMM") + '<br/>' + startsAtMoment.format("Do") + '</p></div>';
};
function formatSummary(event) {
  var fbEvent = formatFbLink(event);
  var link = event.htmlLink;
  if (fbEvent.length > 0) {
    link = fbEvent;
  }
  var calLink = '<a href="' + link + '" target="_blank"><i class="far fa-calendar"></i></a>';
  return '<div class="col-sm-5 align-self-center"> <h3>' + event.summary + ' \/\/ ' + calLink + '</h3> </div>';
};
function formatEvent(event) {
  var summary = formatSummary(event);
  var startEndTime = formatStartEndTime(event);
  var date = formatDate(event);
  var location = formatLocation(event);
  return ['<div class="row gig-event">', date, summary, '<div class="col-sm-5 align-self-center">', startEndTime, location, '</div></div>'].join("");
};
function parseEvents(items) {
  var upcomingEventRows = [];
  var pastEventRows = [];
  var sortedEvents = items.sort(function (e1, e2) {
    return e1.start.dateTime > e2.start.dateTime;
  });
  sortedEvents.forEach(function(event) {
    if (moment(event.start.dateTime) > moment()) {
      upcomingEventRows.push(formatEvent(event));
    } else {
      pastEventRows.push(formatEvent(event));
    };
  });
  if (upcomingEventRows.length > 0) {
    upcomingEventRows.unshift("<h2 class='mb-4 glow'>Upcoming Events</h2>");
  } else {
    upcomingEventRows.unshift("<h2 class='mb-4 glow'>More events coming soon...</h2>");
  };
  if (pastEventRows.length > 0) {
    pastEventRows = pastEventRows.reverse();
    pastEventRows.unshift("<h2 class='mb-4 glow'>Past Events</h2>");
  };
  return {
    upcoming: upcomingEventRows.join(""),
    past: pastEventRows.join("")
  };
};
