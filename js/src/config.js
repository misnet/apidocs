/**
 * APIDoc的相关定义
 * @author Donny
 */
export default {
    API_HOST:process.env.API_HOST,
    APIDOC_HOST:process.env.APIDOCS_HOST + "/api.php?method=",
    MOCK_HOST: process.env.APIDOCS_HOST + "/read.php?mock=1&api=",
    APILIST: {
      API_DETAIL: "detail",
      API_CATES: "",
      API_LIST:"list",
      GLOBAL_PARAMS:"global",
      ERR_CODE:'errcode',
      CLEAR_CACHE:'clearcache'
    }
  };
  