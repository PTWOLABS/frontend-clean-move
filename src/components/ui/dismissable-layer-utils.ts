"use client";

const SELECT_CONTENT_ATTRIBUTE = "data-clean-move-select-content";
const SELECT_CONTENT_SELECTOR = `[${SELECT_CONTENT_ATTRIBUTE}]`;
const OPEN_SELECT_CONTENT_SELECTOR = `[${SELECT_CONTENT_ATTRIBUTE}][data-state="open"]`;

type InteractOutsideEvent = CustomEvent<{
  originalEvent: PointerEvent | FocusEvent;
}>;

type InteractOutsideHandler = (event: InteractOutsideEvent) => void;
type PointerDownOutsideEvent = CustomEvent<{
  originalEvent: PointerEvent;
}>;
type PointerDownOutsideHandler = (event: PointerDownOutsideEvent) => void;

const RECENT_SELECT_OUTSIDE_INTERACTION_MS = 350;

let lastSelectOutsideInteractionAt = 0;

function isElement(target: EventTarget | null): target is Element {
  return target instanceof Element;
}

function hasOpenSelectContent() {
  return (
    typeof document !== "undefined" && document.querySelector(OPEN_SELECT_CONTENT_SELECTOR) !== null
  );
}

function hasRecentSelectOutsideInteraction() {
  return Date.now() - lastSelectOutsideInteractionAt < RECENT_SELECT_OUTSIDE_INTERACTION_MS;
}

function rememberSelectOutsideInteraction() {
  lastSelectOutsideInteractionAt = Date.now();
}

function isSelectContentInteraction(event: InteractOutsideEvent) {
  return isElement(event.target) && event.target.closest(SELECT_CONTENT_SELECTOR) !== null;
}

function preventDismissWhenSelectIsOpen(event: InteractOutsideEvent) {
  if (event.defaultPrevented) {
    return;
  }

  if (
    isSelectContentInteraction(event) ||
    hasOpenSelectContent() ||
    hasRecentSelectOutsideInteraction()
  ) {
    event.preventDefault();
  }
}

function composeSelectAwareInteractOutside(handler?: InteractOutsideHandler) {
  return (event: InteractOutsideEvent) => {
    handler?.(event);
    preventDismissWhenSelectIsOpen(event);
  };
}

function composeSelectAwarePointerDownOutside(handler?: PointerDownOutsideHandler) {
  return (event: PointerDownOutsideEvent) => {
    rememberSelectOutsideInteraction();
    handler?.(event);
  };
}

export {
  SELECT_CONTENT_ATTRIBUTE,
  composeSelectAwareInteractOutside,
  composeSelectAwarePointerDownOutside,
};
