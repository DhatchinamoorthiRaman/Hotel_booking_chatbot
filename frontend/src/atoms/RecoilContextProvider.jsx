/* eslint-disable react/prop-types */
import { RecoilRoot } from "recoil";

export default function RecoilContextProvider(props) {
  return <RecoilRoot>{props.children}</RecoilRoot>;
}
