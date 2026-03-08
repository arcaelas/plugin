import { h, render, Component, Fragment } from '../vendor/preact.mjs';
import { useState, useEffect, useRef, useCallback, useMemo } from '../vendor/preact-hooks.mjs';
import htm from '../vendor/htm.mjs';

const html = htm.bind(h);

export { h, html, render, Component, Fragment, useState, useEffect, useRef, useCallback, useMemo };
