import { assign } from "min-dash";

import BaseLayouter from "diagram-js/lib/layout/BaseLayouter";
import {
  repairConnection,
  withoutRedundantPoints,
} from "diagram-js/lib/layout/ManhattanLayout";
import { getMid, getOrientation } from "diagram-js/lib/layout/LayoutUtil";

export default class CustomLayouter extends BaseLayouter {
  constructor() {
    super();
  }

  layoutConnection(connection, hints) {
    if (!hints) {
      hints = {};
    }

    const source = hints.source || connection.source;
    const target = hints.target || connection.target;
    const waypoints = hints.waypoints || connection.waypoints;
    let connectionStart = hints.connectionStart;
    let connectionEnd = hints.connectionEnd;
    let manhattanOptions;
    let updatedWaypoints;

    if (!connectionStart) {
      connectionStart = getConnectionDocking(waypoints && waypoints[0], source);
    }

    if (!connectionEnd) {
      connectionEnd = getConnectionDocking(
        waypoints && waypoints[waypoints.length - 1],
        target,
      );
    }
    
    if (!(source === target)) {
      return [connectionStart, connectionEnd];
    } else {
      manhattanOptions = {
        preferredLayouts: getLoopPreferredLayout(source, connection),
      };
      manhattanOptions = assign(manhattanOptions, hints);

      updatedWaypoints = withoutRedundantPoints(
        repairConnection(
          source,
          target,
          connectionStart,
          connectionEnd,
          waypoints,
          manhattanOptions,
        ),
      );

      return updatedWaypoints || [connectionStart, connectionEnd];
    }
  }
}

// helpers //////////

function getConnectionDocking(point, shape) {
  return point ? point.original || point : getMid(shape);
}

function getLoopPreferredLayout(source, connection) {
  const waypoints = connection.waypoints;

  const orientation =
    waypoints && waypoints.length && getOrientation(waypoints[0], source);

  if (orientation === "top") {
    return ["t:r"];
  } else if (orientation === "right") {
    return ["r:b"];
  } else if (orientation === "left") {
    return ["l:t"];
  }

  return ["b:l"];
}
